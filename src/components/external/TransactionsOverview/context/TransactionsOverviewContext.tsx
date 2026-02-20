import { createContext } from 'preact';
import { TransactionsOverviewContextValue, TransactionsOverviewProviderProps } from '../types';
import { useContext, useEffect, useMemo, useRef } from 'preact/hooks';
import { useFilterBarState } from '../../../internal/FilterBar';
import useTransactionsList from '../hooks/useTransactionsList';
import useTransactionsTotals from '../hooks/useTransactionsTotals';
import useTransactionsViewSwitcher from '../hooks/useTransactionsViewSwitcher';
import useTransactionsFilters from '../hooks/useTransactionsFilters';
import useAccountBalances from '../../../../hooks/useAccountBalances';
import useCurrenciesLookup from '../hooks/useCurrenciesLookup';

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
    const filterBarState = useFilterBarState();
    const transactionsFiltersResult = useTransactionsFilters();
    const { filters, listQueryParams, insightsQueryParams, filterParams, insightsCurrency } = transactionsFiltersResult;

    const effectiveMode = useMemo(() => (mode === 'overview' && hideInsights ? 'transactions' : mode), [mode, hideInsights]);
    const transactionsViewState = useTransactionsViewSwitcher({ mode: effectiveMode });
    const { isTransactionsView } = transactionsViewState;

    const balanceAccount = filters.value.balanceAccount;
    const defaultCurrency = balanceAccount?.defaultCurrencyCode;
    const hasActiveBalanceAccount = !!balanceAccount?.id;

    const accountBalancesResult = useAccountBalances({ balanceAccount });

    const insightsTotalsResult = useTransactionsTotals({
        fetchEnabled: !isTransactionsView && hasActiveBalanceAccount,
        queryParams: insightsQueryParams,
    });

    const transactionsTotalsResult = useTransactionsTotals({
        fetchEnabled: isTransactionsView && hasActiveBalanceAccount,
        queryParams: listQueryParams,
    });

    const transactionsListResult = useTransactionsList({
        fetchEnabled: mode !== 'insights' && hasActiveBalanceAccount,
        queryParams: listQueryParams,
        allowLimitSelection,
        dataCustomization,
        onFiltersChanged,
        preferredLimit,
        filterParams,
    });

    const currenciesLookupResult = useCurrenciesLookup({
        balances: accountBalancesResult.balances,
        totals: (isTransactionsView ? transactionsTotalsResult : insightsTotalsResult).totals,
        defaultCurrency,
    });

    const availableCurrencies = currenciesLookupResult.sortedCurrencies;
    const cachedAvailableCurrencies = useRef(availableCurrencies);
    const cachedDefaultCurrency = useRef(defaultCurrency);

    useEffect(() => {
        const availableCurrenciesChanged = cachedAvailableCurrencies.current !== availableCurrencies;
        const defaultCurrencyChanged = cachedDefaultCurrency.current !== defaultCurrency;

        if (availableCurrenciesChanged || defaultCurrencyChanged) {
            cachedAvailableCurrencies.current = availableCurrencies;
            cachedDefaultCurrency.current = defaultCurrency;
            insightsCurrency.set(defaultCurrency);
        }
    }, [availableCurrencies, defaultCurrency, insightsCurrency.set]);

    const contextValue = useMemo(
        () => ({
            accountBalancesResult,
            balanceAccounts,
            currenciesLookupResult,
            dataCustomization,
            filterBarState,
            hideInsights,
            hideTitle,
            insightsTotalsResult,
            isLoadingBalanceAccount,
            onContactSupport,
            onRecordSelection,
            showDetails,
            transactionsFiltersResult,
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
            hideInsights,
            hideTitle,
            insightsTotalsResult,
            isLoadingBalanceAccount,
            onContactSupport,
            onRecordSelection,
            showDetails,
            transactionsFiltersResult,
            transactionsListResult,
            transactionsTotalsResult,
            transactionsViewState,
        ]
    );

    return <TransactionsOverviewContext.Provider value={contextValue}>{children}</TransactionsOverviewContext.Provider>;
};
