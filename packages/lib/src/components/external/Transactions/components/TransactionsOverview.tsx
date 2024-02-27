import FilterBar from '@src/components/internal/FilterBar';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { TransactionFilterParam, TransactionsComponentProps } from '@src/components';
import { TIME_RANGE_PRESET_OPTIONS } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
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
import { BalanceAccountsDisplay } from '@src/components/external/Transactions/components/AccountsBalanceDisplay/BalanceAccountsDisplay';
import Select from '@src/components/internal/FormFields/Select';

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

            return transactionsEndpointCall(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: pageRequestParams.statuses ? [pageRequestParams.statuses as any] : undefined,
                    categories: pageRequestParams.categories ? [pageRequestParams.categories as ITransaction['category']] : undefined,
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                },
                path: { balanceAccountId: balanceAccounts?.[0]?.id ?? '' },
            });
        },
        [balanceAccounts, transactionsEndpointCall]
    );

    // FILTERS

    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const transactionsFilterParams = {
        [TransactionFilterParam.CATEGORIES]: undefined,
        [TransactionFilterParam.STATUSES]: undefined,
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

    const [updateCreatedDateFilter, updateFilterSelect] = useMemo(() => {
        // TODO - Use on new filters or delete if not necessary
        /* const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value || undefined });
                    break;
            }
        }; */

        // TODO - Create a proper callback
        const updateMultiSelectFilter = (filter: TransactionFilterParam.CATEGORIES | TransactionFilterParam.STATUSES, value?: string) => {
            updateFilters({
                [filter]: value,
            });
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

    //TODO - Replace with the value of the balanceAccount filter
    const balanceAccountId = useMemo(() => balanceAccounts?.[0]?.id, [balanceAccounts]);

    //TODO - Replace with the value of the statuses filter
    const statuses: ITransaction['status'][] = ['Pending', 'Booked'];

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
                <Select
                    onChange={val => updateFilterSelect(TransactionFilterParam.CATEGORIES, val.target.value)}
                    placeholder={'Select category'}
                    selected={filters.categories}
                    items={[
                        { name: 'Payment', id: 'Payment' },
                        { name: 'Capital', id: 'Capital' },
                        { name: 'Refund', id: 'Refund' },
                    ]}
                />
                <Select
                    onChange={val => updateFilterSelect(TransactionFilterParam.STATUSES, val.target.value)}
                    placeholder={'Select status'}
                    selected={filters.statuses}
                    items={[
                        { name: 'Pending', id: 'Pending' },
                        { name: 'Booked', id: 'Booked' },
                        { name: 'Rejected', id: 'Rejected' },
                    ]}
                />
            </FilterBar>
            <div className="adyen-fp-transactions__balance-totals">
                <TransactionTotals
                    balanceAccountId={balanceAccountId}
                    statuses={statuses}
                    categories={transactionsFilterParams[TransactionFilterParam.CATEGORIES] as unknown as ITransaction['category'][]}
                    createdUntil={transactionsFilterParams[TransactionFilterParam.CREATED_UNTIL]}
                    createdSince={transactionsFilterParams[TransactionFilterParam.CREATED_SINCE]}
                />
                <BalanceAccountsDisplay balanceAccountId={balanceAccountId} />
            </div>

            <TransactionList
                loading={fetching || !balanceAccounts}
                transactions={records}
                onTransactionSelected={onTransactionSelected}
                showPagination={true}
                showDetails={showDetails}
                limit={limit}
                limitOptions={limitOptions}
                onLimitSelection={updateLimit}
                error={error}
                {...paginationProps}
            />
        </>
    );
};
