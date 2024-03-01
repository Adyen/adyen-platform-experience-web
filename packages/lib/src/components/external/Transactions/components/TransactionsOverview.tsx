import FilterBar from '@src/components/internal/FilterBar';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter';
import { TransactionsComponentProps, TransactionFilterParam } from '../types';
import { getTimeRangeSelectionDefaultPresetOptions } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import TransactionList from '@src/components/external/Transactions/components/TransactionList';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { DateFilterProps, DateRangeFilterParam } from '@src/components/internal/FilterBar/filters/DateFilter/types';
import { EMPTY_OBJECT, isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import TransactionTotals from '@src/components/external/Transactions/components/TransactionTotals/TransactionTotals';
import { BalanceAccountsDisplay } from '@src/components/external/Transactions/components/AccountsBalanceDisplay/BalanceAccountsDisplay';
import BalanceAccountSelector, { useBalanceAccountSelection } from './BalanceAccountSelector';
import MultiSelectionFilter, { DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS, listFrom } from './MultiSelectionFilter';
import useTransactionsOverviewMultiSelectionFilters from '../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

const computeDefaultTransactionsFilterParams = () => {
    const timeRangePresetOptions = getTimeRangeSelectionDefaultPresetOptions();
    const defaultTimeRangePresetOption = 'rangePreset.last7Days';
    const { from, to } = timeRangePresetOptions[defaultTimeRangePresetOption];

    const defaultTransactionsFilterParams = {
        ...DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS,
        [TransactionFilterParam.CREATED_SINCE]: new Date(from).toISOString(),
        [TransactionFilterParam.CREATED_UNTIL]: new Date(to).toISOString(),
    } as const;

    return { defaultTimeRangePresetOption, defaultTransactionsFilterParams, timeRangePresetOptions } as const;
};

export const TransactionsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onTransactionSelected,
    showDetails,
    onContactSupport,
    isLoadingBalanceAccount,
}: TransactionsComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }) => {
    const { i18n } = useCoreContext();
    const transactionsEndpointCall = useSetupEndpoint('getTransactions');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const transactionsFilterParams = useRef(computeDefaultTransactionsFilterParams());
    const now = useRef(Date.now());

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

            return transactionsEndpointCall(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<ITransaction['status']>(pageRequestParams[TransactionFilterParam.STATUSES]),
                    categories: listFrom<ITransaction['category']>(pageRequestParams[TransactionFilterParam.CATEGORIES]),
                    currencies: listFrom<ITransaction['amount']['currency']>(pageRequestParams[TransactionFilterParam.CURRENCIES]),
                    createdSince:
                        pageRequestParams[TransactionFilterParam.CREATED_SINCE] ??
                        transactionsFilterParams.current.defaultTransactionsFilterParams[TransactionFilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[TransactionFilterParam.CREATED_UNTIL] ??
                        transactionsFilterParams.current.defaultTransactionsFilterParams[TransactionFilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                },
                path: { balanceAccountId: activeBalanceAccount?.id ?? '' },
            });
        },
        [activeBalanceAccount, transactionsEndpointCall]
    );

    // FILTERS

    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const defaultTimeRangePreset = useMemo(() => i18n.get(transactionsFilterParams.current.defaultTimeRangePresetOption), [i18n]);
    const [selectedTimeRangePreset, setSelectedTimeRangePreset] = useState(defaultTimeRangePreset);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>({
            fetchRecords: getTransactions,
            dataField: 'transactions',
            filterParams: transactionsFilterParams.current.defaultTransactionsFilterParams,
            initialFiltersSameAsDefault: true,
            onLimitChanged: _onLimitChanged,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id,
        });

    const { categoriesFilter, currenciesFilter, statusesFilter, setTransactionsCurrencies } = useTransactionsOverviewMultiSelectionFilters({
        filters,
        updateFilters,
    });

    const updateCreatedDateFilter = useCallback(
        (params: Parameters<DateFilterProps['onChange']>[0] = EMPTY_OBJECT) => {
            for (const [param, value] of Object.entries(params) as [keyof typeof params, (typeof params)[keyof typeof params]][]) {
                switch (param) {
                    case 'selectedPresetOption':
                        setSelectedTimeRangePreset(value || defaultTimeRangePreset);
                        break;
                    case DateRangeFilterParam.FROM:
                        updateFilters({
                            [TransactionFilterParam.CREATED_SINCE]:
                                value || transactionsFilterParams.current.defaultTransactionsFilterParams[TransactionFilterParam.CREATED_SINCE],
                        });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({
                            [TransactionFilterParam.CREATED_UNTIL]:
                                value || transactionsFilterParams.current.defaultTransactionsFilterParams[TransactionFilterParam.CREATED_UNTIL],
                        });
                        break;
                }
            }
        },
        [defaultTimeRangePreset, updateFilters]
    );

    useMemo(() => !canResetFilters && setSelectedTimeRangePreset(defaultTimeRangePreset), [canResetFilters, defaultTimeRangePreset]);

    return (
        <>
            <FilterBar>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <DateFilter
                    classNameModifiers={['createdSince']}
                    label={i18n.get('dateRange')}
                    name={TransactionFilterParam.CREATED_SINCE}
                    untilDate={new Date(now.current).toString()}
                    from={filters[TransactionFilterParam.CREATED_SINCE]}
                    to={filters[TransactionFilterParam.CREATED_UNTIL]}
                    selectedPresetOption={selectedTimeRangePreset}
                    timeRangePresetOptions={transactionsFilterParams.current.timeRangePresetOptions}
                    timezone={activeBalanceAccount?.timeZone}
                    onChange={updateCreatedDateFilter}
                    showTimezoneInfo={true}
                    now={now.current}
                />
                <MultiSelectionFilter {...statusesFilter} placeholder={i18n.get('filterPlaceholder.status')} />
                <MultiSelectionFilter {...categoriesFilter} placeholder={i18n.get('filterPlaceholder.category')} />
                <MultiSelectionFilter {...currenciesFilter} placeholder={i18n.get('filterPlaceholder.currency')} />
            </FilterBar>
            <div className="adyen-fp-transactions__balance-totals">
                <TransactionTotals
                    balanceAccountId={activeBalanceAccount?.id}
                    statuses={statusesFilter.selection}
                    categories={categoriesFilter.selection}
                    createdUntil={filters[TransactionFilterParam.CREATED_UNTIL]!}
                    createdSince={filters[TransactionFilterParam.CREATED_SINCE]!}
                />
                <BalanceAccountsDisplay balanceAccountId={activeBalanceAccount?.id} updateBalanceAccountCurrencies={setTransactionsCurrencies} />
            </div>

            <TransactionList
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                transactions={records}
                onTransactionSelected={onTransactionSelected}
                showPagination={true}
                showDetails={showDetails}
                limit={limit}
                limitOptions={limitOptions}
                onLimitSelection={updateLimit}
                error={error as AdyenFPError}
                onContactSupport={onContactSupport}
                {...paginationProps}
            />
        </>
    );
};
