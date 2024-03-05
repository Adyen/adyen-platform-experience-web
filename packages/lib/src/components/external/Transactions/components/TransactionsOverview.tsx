import FilterBar from '@src/components/internal/FilterBar';
import { ExternalUIComponentProps } from '@src/components/types';
import { TransactionsComponentProps, TransactionFilterParam } from '../types';
import TransactionList from '@src/components/external/Transactions/components/TransactionList';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import TransactionsOverviewDateFilter from '@src/components/external/Transactions/components/TransactionsOverviewDateFilter';
import TransactionTotals from '@src/components/external/Transactions/components/TransactionTotals/TransactionTotals';
import { BalanceAccountsDisplay } from '@src/components/external/Transactions/components/AccountsBalanceDisplay/BalanceAccountsDisplay';
import BalanceAccountSelector, { useBalanceAccountSelection } from './BalanceAccountSelector';
import MultiSelectionFilter, { listFrom } from './MultiSelectionFilter';
import useDefaultTransactionsOverviewFilterParams from '../hooks/useDefaultTransactionsOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

export const TransactionsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onTransactionSelected,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
}: ExternalUIComponentProps<
    TransactionsComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const transactionsEndpointCall = useSetupEndpoint('getTransactions');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultFilterParams, defaultTimeRange, nowTimestamp, refreshNowTimestamp, timeRangeOptions } =
        useDefaultTransactionsOverviewFilterParams(activeBalanceAccount);

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
                        pageRequestParams[TransactionFilterParam.CREATED_SINCE] ?? defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[TransactionFilterParam.CREATED_UNTIL] ?? defaultFilterParams[TransactionFilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                },
            });
        },
        [activeBalanceAccount, defaultFilterParams, transactionsEndpointCall]
    );

    // FILTERS
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>({
            fetchRecords: getTransactions,
            dataField: 'transactions',
            filterParams: defaultFilterParams,
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

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <>
            <FilterBar>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <TransactionsOverviewDateFilter
                    defaultFilterParams={defaultFilterParams}
                    defaultTimeRange={defaultTimeRange}
                    canResetFilters={canResetFilters}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    timeRangeOptions={timeRangeOptions}
                    updateFilters={updateFilters}
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
                    currencies={listFrom(filters[TransactionFilterParam.CURRENCIES])}
                    minAmount={0} // Will be fixed in next PR with the amount filter
                    maxAmount={0} // Will be fixed in next PR with the amount filter
                />
                <BalanceAccountsDisplay balanceAccountId={activeBalanceAccount?.id} updateBalanceAccountCurrencies={setTransactionsCurrencies} />
            </div>

            <TransactionList
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                transactions={records}
                onTransactionSelected={onTransactionSelected}
                showPagination={true}
                showDetails={showDetails}
                balanceAccountDescription={activeBalanceAccount?.description || ''}
                limit={limit}
                limitOptions={limitOptions}
                onContactSupport={onContactSupport}
                onLimitSelection={updateLimit}
                error={error as AdyenFPError}
                {...paginationProps}
            />
        </>
    );
};
