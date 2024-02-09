import FilterBar from '@src/components/internal/FilterBar';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { TransactionFilterParam, TransactionsComponentProps } from '@src/components';
import { TIME_RANGE_PRESET_OPTIONS } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import Alert from '@src/components/internal/Alert';
import TransactionList from '@src/components/external/Transactions/components/TransactionList';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { DateFilterProps, DateRangeFilterParam } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { EMPTY_OBJECT, isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { TranslationKey } from '@src/core/Localization/types';
import TransactionTotals from '@src/components/external/Transactions/components/TransactionTotals/TransactionTotals';

const { from, to } = Object.values(TIME_RANGE_PRESET_OPTIONS)[0]!;
const DEFAULT_TIME_RANGE_PRESET = Object.keys(TIME_RANGE_PRESET_OPTIONS)[0]! as TranslationKey;
const DEFAULT_CREATED_SINCE = new Date(from).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(to).toISOString();

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

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions: SetupHttpOptions = {
                errorLevel: 'error',
                signal,
            };

            const parameters = {
                query: {
                    ...pageRequestParams,
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                },
                path: { balanceAccountId: balanceAccounts?.[0]?.id ?? '' },
            };
            return transactionsEndpointCall(requestOptions, parameters);
        },
        [balanceAccounts, transactionsEndpointCall]
    );

    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const transactionsFilterParams = {
        [TransactionFilterParam.ACCOUNT_HOLDER]: undefined,
        [TransactionFilterParam.BALANCE_ACCOUNT]: undefined,
        [TransactionFilterParam.BALANCE_PLATFORM_ID]: undefined,
        [TransactionFilterParam.CREATED_SINCE]: DEFAULT_CREATED_SINCE,
        [TransactionFilterParam.CREATED_UNTIL]: DEFAULT_CREATED_UNTIL,
    };

    const defaultTimeRangePreset = useMemo(() => i18n.get(DEFAULT_TIME_RANGE_PRESET), [i18n]);
    const [selectedTimeRangePreset, setSelectedTimeRangePreset] = useState(defaultTimeRangePreset);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>(
            useMemo(
                () => ({
                    fetchRecords: getTransactions,
                    dataField: 'transactions',
                    filterParams: transactionsFilterParams,
                    initialFiltersSameAsDefault: false,
                    onLimitChanged: _onLimitChanged,
                    onFiltersChanged: _onFiltersChanged,
                    preferredLimit,
                    preferredLimitOptions,
                    enabled: !!balanceAccounts,
                }),
                [_onFiltersChanged, _onLimitChanged, getTransactions, preferredLimit, preferredLimitOptions, balanceAccounts]
            )
        );

    const [updateCreatedDateFilter] = useMemo(() => {
        // TODO - Use on new filters or delete if not necessary
        /* const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value || undefined });
                    break;
            }
        }; */

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

        return [_updateDateFilter];
    }, [defaultTimeRangePreset, updateFilters]);

    useMemo(() => !canResetFilters && setSelectedTimeRangePreset(defaultTimeRangePreset), [canResetFilters]);

    const showAlert = useMemo(() => !fetching && error, [fetching, error]);

    //TODO - Replace with the value of the balanceAccount filter
    const balanceAccountId = useMemo(() => balanceAccounts?.[0]?.id, [balanceAccounts]);

    //TODO - Replace with the value of the statuses filter
    const statuses: ITransaction['status'][] = ['Pending', 'Booked'];

    //TODO - Replace with the value of the categories filter
    const categories: ITransaction['category'][] = ['ATM', 'Payment'];

    return (
        <>
            <FilterBar canResetFilters={canResetFilters} resetFilters={resetFilters}>
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
            </FilterBar>
            <TransactionTotals
                balanceAccountId={balanceAccountId}
                statuses={statuses}
                categories={categories}
                createdUntil={transactionsFilterParams[TransactionFilterParam.CREATED_UNTIL]}
                createdSince={transactionsFilterParams[TransactionFilterParam.CREATED_SINCE]}
            />
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
