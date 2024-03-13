import FilterBar from '@src/components/internal/FilterBar';
import { ExternalUIComponentProps } from '@src/components/types';
import { TransactionsComponentProps, TransactionFilterParam } from '../types';
import TransactionList from '@src/components/external/Transactions/components/TransactionList';
import useCoreContext from '@src/core/Context/useCoreContext';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase, ITransaction } from '@src/types';
import { isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import TransactionsOverviewDateFilter from '@src/components/external/Transactions/components/TransactionsOverviewDateFilter';
import TransactionTotals from '@src/components/external/Transactions/components/TransactionTotals/TransactionTotals';
import { Balances } from '@src/components/external/Transactions/components/Balances/Balances';
import BalanceAccountSelector, { useBalanceAccountSelection } from './BalanceAccountSelector';
import MultiSelectionFilter, { listFrom } from './MultiSelectionFilter';
import useDefaultTransactionsOverviewFilterParams from '../hooks/useDefaultTransactionsOverviewFilterParams';
import useTransactionsOverviewMultiSelectionFilters from '../hooks/useTransactionsOverviewMultiSelectionFilters';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { AmountFilter } from '@src/components/internal/FilterBar/filters/AmountFilter/AmountFilter';

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
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultTransactionsOverviewFilterParams(activeBalanceAccount);

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
                        defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[TransactionFilterParam.CREATED_UNTIL] ??
                        defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                    minAmount: pageRequestParams.minAmount !== undefined ? parseFloat(pageRequestParams.minAmount) : undefined,
                    maxAmount: pageRequestParams.maxAmount !== undefined ? parseFloat(pageRequestParams.maxAmount) : undefined,
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, transactionsEndpointCall]
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
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onLimitChanged: _onLimitChanged,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id,
        });

    const [availableCurrencies, setAvailableCurrencies] = useState<ITransaction['amount']['currency'][] | undefined>([]);

    const { categoriesFilter, currenciesFilter, statusesFilter } = useTransactionsOverviewMultiSelectionFilters(
        {
            filters,
            updateFilters,
        },
        availableCurrencies
    );

    const handleBalanceAccountSelection = useCallback(
        (target: any) => {
            onBalanceAccountSelection(target);

            // reset currency filter on balance account change
            setAvailableCurrencies(undefined);
            updateFilters({ [TransactionFilterParam.CURRENCIES]: undefined });
        },
        [onBalanceAccountSelection, updateFilters]
    );

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <>
            <FilterBar>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={handleBalanceAccountSelection}
                />
                <TransactionsOverviewDateFilter
                    canResetFilters={canResetFilters}
                    defaultParams={defaultParams}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    updateFilters={updateFilters}
                />
                <AmountFilter
                    availableCurrencies={availableCurrencies}
                    selectedCurrencies={listFrom(filters[TransactionFilterParam.CURRENCIES])}
                    name={'range'}
                    label={i18n.get('amount')}
                    minAmount={filters[TransactionFilterParam.MIN_AMOUNT]}
                    maxAmount={filters[TransactionFilterParam.MAX_AMOUNT]}
                    updateFilters={updateFilters}
                    onChange={updateFilters}
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
                    currencies={currenciesFilter.selection}
                    minAmount={filters[TransactionFilterParam.MIN_AMOUNT] ? parseFloat(filters[TransactionFilterParam.MIN_AMOUNT]) : undefined}
                    maxAmount={filters[TransactionFilterParam.MAX_AMOUNT] ? parseFloat(filters[TransactionFilterParam.MAX_AMOUNT]) : undefined}
                />
                <Balances balanceAccountId={activeBalanceAccount?.id} updateBalanceAccountCurrencies={setAvailableCurrencies} />
            </div>

            <TransactionList
                balanceAccounts={balanceAccounts}
                availableCurrencies={availableCurrencies}
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
