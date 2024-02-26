import FilterBar from '@src/components/internal/FilterBar';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { TransactionFilterParam, TransactionsComponentProps } from '@src/components';
import { TIME_RANGE_PRESET_OPTIONS } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import Alert from '@src/components/internal/Alert';
import TransactionList from '@src/components/external/Transactions/components/TransactionList';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { DateFilterProps, DateRangeFilterParam } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { EMPTY_ARRAY, EMPTY_OBJECT, isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { TranslationKey } from '@src/core/Localization/types';
import TransactionTotals from '@src/components/external/Transactions/components/TransactionTotals/TransactionTotals';
import { BalanceAccountsDisplay } from '@src/components/external/Transactions/components/AccountsBalanceDisplay/BalanceAccountsDisplay';
import Select from '@src/components/internal/FormFields/Select';
import { SelectItem } from '@src/components/internal/FormFields/Select/types';
import useBalanceAccountSelection from '../hooks/useBalanceAccountSelection';

const { from, to } = Object.values(TIME_RANGE_PRESET_OPTIONS)[0]!;
const DEFAULT_TIME_RANGE_PRESET = Object.keys(TIME_RANGE_PRESET_OPTIONS)[0]! as TranslationKey;
const DEFAULT_CREATED_SINCE = new Date(from).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(to).toISOString();

const TRANSACTION_STATUSES = ['Booked', 'Pending', 'Rejected'] as const;
const TRANSACTION_TYPES = ['ATM', 'Capital', 'Chargeback', 'Correction', 'Fee', 'Payment', 'Refund', 'Transfer', 'Other'] as const;

const transactionStatusFilterItems = Object.freeze(TRANSACTION_STATUSES.map(status => ({ id: status, name: status } as SelectItem)));
const transactionTypeFilterItems = Object.freeze(TRANSACTION_TYPES.map(type => ({ id: type, name: type } as SelectItem)));

const listFrom = <T extends string = string>(value?: string | any[]) => {
    const stringedValue = `${value}`.trim();
    return (stringedValue ? stringedValue.split(/(?:\s*,\s*)+/).filter(Boolean) : EMPTY_ARRAY) as T[];
};

// const useTransactionsOverviewFilters = () => {
//     const defaultFilterParams = useRef({
//         [TransactionFilterParam.CURRENCIES]: '',
//         [TransactionFilterParam.CATEGORIES]: '',
//         [TransactionFilterParam.STATUSES]: '',
//         get [TransactionFilterParam.CREATED_SINCE]() {
//             return new Date(from).toISOString();
//         },
//         get [TransactionFilterParam.CREATED_UNTIL]() {
//             return new Date(to).toISOString();
//         },
//     });
//
//     const getSelectFilterParam = useCallback(
//         <T extends string = string>(param: TransactionFilterParam.CATEGORIES | TransactionFilterParam.CURRENCIES | TransactionFilterParam.STATUSES) =>
//             listFrom<T>(filters[param] ?? defaultFilterParams.current[param]),
//         [filters]
//     );
//
//     const categories = useMemo(() => getSelectFilterParam<ITransaction['category']>(TransactionFilterParam.CATEGORIES), [getSelectFilterParam]);
//     const currencies = useMemo(() => getSelectFilterParam/*<ITransaction['currency']>*/(TransactionFilterParam.CURRENCIES), [getSelectFilterParam]);
//     const statuses = useMemo(() => getSelectFilterParam<ITransaction['status']>(TransactionFilterParam.STATUSES), [getSelectFilterParam]);
// };

export const TransactionsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onTransactionSelected,
    showDetails,
}: TransactionsComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined }) => {
    const { i18n } = useCoreContext();
    const transactionsEndpointCall = useSetupEndpoint('getTransactions');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const [availableCurrencies, setAvailableCurrencies] = useState<readonly string[]>();

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions: SetupHttpOptions = {
                errorLevel: 'error',
                signal,
            };

            const parameters = {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<ITransaction['status']>(pageRequestParams[TransactionFilterParam.STATUSES]),
                    categories: listFrom<ITransaction['category']>(pageRequestParams[TransactionFilterParam.CATEGORIES]),
                    // currencies: listFrom<ITransaction['currency']>(pageRequestParams[TransactionFilterParam.CURRENCIES]),
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                },
                path: { balanceAccountId: activeBalanceAccount?.id! },
            };
            return transactionsEndpointCall(requestOptions, parameters);
        },
        [activeBalanceAccount, transactionsEndpointCall]
    );

    // FILTERS

    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const defaultTimeRangePreset = useMemo(() => i18n.get(DEFAULT_TIME_RANGE_PRESET), [i18n]);
    const [selectedTimeRangePreset, setSelectedTimeRangePreset] = useState(defaultTimeRangePreset);

    const transactionsFilterParams = useRef({
        [TransactionFilterParam.CURRENCIES]: '',
        [TransactionFilterParam.CATEGORIES]: '',
        [TransactionFilterParam.STATUSES]: '',
        [TransactionFilterParam.CREATED_SINCE]: DEFAULT_CREATED_SINCE,
        [TransactionFilterParam.CREATED_UNTIL]: DEFAULT_CREATED_UNTIL,
    });

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>(
            useMemo(
                () => ({
                    fetchRecords: getTransactions,
                    dataField: 'transactions',
                    filterParams: transactionsFilterParams.current,
                    initialFiltersSameAsDefault: true,
                    onLimitChanged: _onLimitChanged,
                    onFiltersChanged: _onFiltersChanged,
                    preferredLimit,
                    preferredLimitOptions,
                    enabled: !!activeBalanceAccount?.id,
                }),
                [_onFiltersChanged, _onLimitChanged, getTransactions, preferredLimit, preferredLimitOptions, activeBalanceAccount]
            )
        );

    const categories = useMemo(
        () =>
            listFrom<ITransaction['category']>(
                filters[TransactionFilterParam.CATEGORIES] ?? transactionsFilterParams.current[TransactionFilterParam.CATEGORIES]
            ),
        [filters]
    );
    const currencies = useMemo(
        () =>
            listFrom(
                /*<ITransaction['currency']>*/ filters[TransactionFilterParam.CURRENCIES] ??
                    transactionsFilterParams.current[TransactionFilterParam.CURRENCIES]
            ),
        [filters]
    );
    const statuses = useMemo(
        () =>
            listFrom<ITransaction['status']>(
                filters[TransactionFilterParam.STATUSES] ?? transactionsFilterParams.current[TransactionFilterParam.STATUSES]
            ),
        [filters]
    );

    const [updateCreatedDateFilter, updateSelectionFilter] = useMemo(() => {
        // TODO - Create a proper callback
        const updateMultiSelectFilter = (
            param: TransactionFilterParam.CATEGORIES | TransactionFilterParam.CURRENCIES | TransactionFilterParam.STATUSES,
            value?: string
        ) => {
            updateFilters({ [param]: value || '' });
        };

        const _updateDateFilter: DateFilterProps['onChange'] = (params = EMPTY_OBJECT) => {
            for (const [param, value] of Object.entries(params) as [keyof typeof params, (typeof params)[keyof typeof params]][]) {
                switch (param) {
                    case 'selectedPresetOption':
                        setSelectedTimeRangePreset(value || defaultTimeRangePreset);
                        break;
                    case DateRangeFilterParam.FROM:
                        updateFilters({ [TransactionFilterParam.CREATED_SINCE]: value || DEFAULT_CREATED_SINCE });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({ [TransactionFilterParam.CREATED_UNTIL]: value || DEFAULT_CREATED_UNTIL });
                        break;
                }
            }
        };

        return [_updateDateFilter, updateMultiSelectFilter];
    }, [defaultTimeRangePreset, updateFilters]);

    useMemo(() => !canResetFilters && setSelectedTimeRangePreset(defaultTimeRangePreset), [canResetFilters]);

    const showAlert = useMemo(() => !fetching && error, [fetching, error]);

    return (
        <>
            <FilterBar canResetFilters={canResetFilters} resetFilters={resetFilters}>
                {balanceAccountSelectionOptions && (
                    <Select
                        onChange={onBalanceAccountSelection}
                        filterable={false}
                        multiSelect={false}
                        selected={activeBalanceAccount?.id}
                        withoutCollapseIndicator={true}
                        items={balanceAccountSelectionOptions}
                    />
                )}
                <DateFilter
                    classNameModifiers={['createdSince']}
                    label={i18n.get('dateRange')}
                    name={TransactionFilterParam.CREATED_SINCE}
                    untilDate={new Date().toString()}
                    from={filters[TransactionFilterParam.CREATED_SINCE]}
                    to={filters[TransactionFilterParam.CREATED_UNTIL]}
                    selectedPresetOption={selectedTimeRangePreset}
                    timeRangePresetOptions={TIME_RANGE_PRESET_OPTIONS}
                    onChange={updateCreatedDateFilter}
                />
                <Select
                    onChange={({ target }) => updateSelectionFilter(TransactionFilterParam.STATUSES, target?.value)}
                    filterable={false}
                    multiSelect={true}
                    placeholder={'Status'}
                    selected={statuses}
                    withoutCollapseIndicator={true}
                    items={transactionStatusFilterItems}
                />
                <Select
                    onChange={({ target }) => updateSelectionFilter(TransactionFilterParam.CATEGORIES, target?.value)}
                    filterable={false}
                    multiSelect={true}
                    placeholder={'Type'}
                    selected={categories}
                    withoutCollapseIndicator={true}
                    items={transactionTypeFilterItems}
                />
                {availableCurrencies?.length! > 1 && (
                    <Select
                        onChange={({ target }) => updateSelectionFilter(TransactionFilterParam.CURRENCIES, target?.value)}
                        filterable={false}
                        multiSelect={true}
                        placeholder={'Currency'}
                        selected={currencies}
                        withoutCollapseIndicator={true}
                        items={Object.freeze(availableCurrencies!.map(currency => ({ id: currency, name: currency } as SelectItem)))}
                    />
                )}
            </FilterBar>
            <div className="adyen-fp-transactions__balance-totals">
                <TransactionTotals
                    balanceAccountId={activeBalanceAccount?.id}
                    statuses={statuses}
                    categories={categories}
                    // currencies={currencies}
                    createdUntil={filters[TransactionFilterParam.CREATED_UNTIL]!}
                    createdSince={filters[TransactionFilterParam.CREATED_SINCE]!}
                />
                <BalanceAccountsDisplay balanceAccountId={activeBalanceAccount?.id} getAvailableCurrencies={setAvailableCurrencies} />
            </div>
            {showAlert ? (
                <Alert icon={'cross'}>{error?.message ?? i18n.get('unableToLoadTransactions')}</Alert>
            ) : (
                <TransactionList
                    loading={fetching || !records}
                    transactions={records}
                    onTransactionSelected={onTransactionSelected}
                    showPagination={true}
                    showDetails={showDetails}
                    limit={limit}
                    limitOptions={limitOptions}
                    onLimitSelection={updateLimit}
                    {...paginationProps}
                />
            )}
        </>
    );
};
