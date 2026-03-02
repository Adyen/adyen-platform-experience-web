import { createContext } from 'preact';
import { INITIAL_FILTERS } from '../constants';
import { TransactionsFilters, TransactionsOverviewContextValue, TransactionsOverviewProviderProps, TransactionsView } from '../types';
import { useCallback, useContext, useMemo, useState } from 'preact/hooks';
import { useFilterBarState } from '../../../internal/FilterBar';
import useTransactionsList from '../hooks/useTransactionsList';
import useTransactionsTotals, { GetQueryParams } from '../hooks/useTransactionsTotals';
import useTransactionsViewSwitcher from '../hooks/useTransactionsViewSwitcher';
import useAccountBalances from '../../../../hooks/useAccountBalances';
import useCurrenciesLookup from '../hooks/useCurrenciesLookup';

const INSIGHTS_FILTERS_SET = new Set<keyof TransactionsFilters>(['balanceAccount', 'createdDate']);

const getTransactionsTotalsQueryParams: GetQueryParams = allQueryParams => allQueryParams;

const getInsightsTotalsQueryParams: GetQueryParams = ({ balanceAccountId, createdSince, createdUntil }) => ({
    balanceAccountId,
    createdSince,
    createdUntil,
});

const TransactionsOverviewContext = createContext<TransactionsOverviewContextValue | undefined>(undefined);

export const useTransactionsOverviewContext = () => {
    const context = useContext(TransactionsOverviewContext);
    if (context) return context;
    throw new Error('useTransactionsOverviewContext must be used within TransactionsOverviewProvider');
};

export const TransactionsOverviewProvider = ({
    allowLimitSelection,
    balanceAccounts,
    children,
    dataCustomization,
    hideInsights,
    hideTitle,
    isLoadingBalanceAccount,
    mode = 'overview',
    onContactSupport,
    onFiltersChanged,
    onRecordSelection,
    preferredLimit,
    showDetails,
}: TransactionsOverviewProviderProps) => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [lastFiltersChangeTimestamp, setLastFiltersChangeTimestamp] = useState(Date.now());
    const [insightsCurrency, setInsightsCurrency] = useState<string>();

    const filterBarState = useFilterBarState();

    const lockedView = useMemo(() => {
        if (mode === 'insights') return TransactionsView.INSIGHTS;
        if (hideInsights) return TransactionsView.TRANSACTIONS;
    }, [hideInsights, mode]);

    const transactionsViewState = useTransactionsViewSwitcher({ view: lockedView });
    const isTransactionsView = transactionsViewState.activeView !== TransactionsView.INSIGHTS;
    const hasActiveBalanceAccount = !!filters.balanceAccount?.id;

    const onFiltersChange = useCallback((nextFilters: Readonly<TransactionsFilters>) => {
        setLastFiltersChangeTimestamp(Date.now());
        setFilters(nextFilters);
    }, []);

    const accountBalancesResult = useAccountBalances({ balanceAccount: filters.balanceAccount });

    const insightsTotalsResult = useTransactionsTotals({
        fetchEnabled: !isTransactionsView && hasActiveBalanceAccount,
        getQueryParams: getInsightsTotalsQueryParams,
        applicableFilters: INSIGHTS_FILTERS_SET,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        fetchEnabled: isTransactionsView && hasActiveBalanceAccount,
        getQueryParams: getTransactionsTotalsQueryParams,
        now: lastFiltersChangeTimestamp,
        filters,
    });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: mode !== 'insights' && hasActiveBalanceAccount,
        now: lastFiltersChangeTimestamp,
        allowLimitSelection,
        dataCustomization,
        onFiltersChanged,
        preferredLimit,
        filters,
    });

    const currenciesLookupResult = useCurrenciesLookup({
        defaultCurrency: filters.balanceAccount?.defaultCurrencyCode,
        balances: accountBalancesResult.balances,
        totals: (isTransactionsView ? transactionsTotalsResult : insightsTotalsResult).totals,
    });

    const contextValue = useMemo(
        () => ({
            accountBalancesResult,
            balanceAccounts,
            currenciesLookupResult,
            dataCustomization,
            filterBarState,
            filters,
            hideInsights,
            hideTitle,
            insightsCurrency,
            insightsTotalsResult,
            isLoadingBalanceAccount,
            isTransactionsView,
            lastFiltersChangeTimestamp,
            onContactSupport,
            onFiltersChange,
            onRecordSelection,
            setInsightsCurrency,
            showDetails,
            transactionsListResult,
            transactionsTotalsResult,
            transactionsViewState,
        }),
        [
            accountBalancesResult,
            balanceAccounts,
            currenciesLookupResult,
            dataCustomization,
            filterBarState,
            filters,
            hideInsights,
            hideTitle,
            insightsCurrency,
            insightsTotalsResult,
            isLoadingBalanceAccount,
            isTransactionsView,
            lastFiltersChangeTimestamp,
            onContactSupport,
            onFiltersChange,
            onRecordSelection,
            showDetails,
            transactionsListResult,
            transactionsTotalsResult,
            transactionsViewState,
        ]
    );

    return <TransactionsOverviewContext.Provider value={contextValue}>{children}</TransactionsOverviewContext.Provider>;
};
