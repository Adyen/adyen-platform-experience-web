import { ref, computed, provide, inject, watch, type InjectionKey } from 'vue';
import { useTransactionsAccountBalances } from './useTransactionsAccountBalances';
import { useTransactionsList } from './useTransactionsList';
import { useTransactionsTotals } from './useTransactionsTotals';
import { useCurrenciesLookup } from './useCurrenciesLookup';
import { useTransactionsViewSwitcher, TransactionsView } from './useTransactionsViewSwitcher';
import { quickSelectDateRanges } from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { TransactionsFilters, TransactionsOverviewProps } from '../types';

const INSIGHTS_FILTERS: Set<keyof TransactionsFilters> = new Set(['balanceAccountId', 'createdSince', 'createdUntil']);

const getDefaultFilters = (balanceAccountId?: string): TransactionsFilters => ({
    balanceAccountId,
    categories: [],
    statuses: ['Booked'],
    currencies: [],
    createdSince: new Date(quickSelectDateRanges.last180Days.startDate).toISOString(),
    createdUntil: new Date(quickSelectDateRanges.last180Days.endDate).toISOString(),
    paymentPspReference: undefined,
});

export type TransactionsOverviewStateKey = ReturnType<typeof useTransactionsOverviewState>;

const TRANSACTIONS_OVERVIEW_STATE_KEY: InjectionKey<TransactionsOverviewStateKey> = Symbol('TransactionsOverviewState');

type TransactionsOverviewStateProps = Pick<
    TransactionsOverviewProps,
    'allowLimitSelection' | 'balanceAccountId' | 'dataCustomization' | 'onFiltersChanged' | 'preferredLimit'
> & {
    balanceAccounts?: IBalanceAccountBase[];
    fetchEnabled: boolean;
    hideInsights?: boolean;
};

export function useTransactionsOverviewState(componentProps: () => TransactionsOverviewStateProps) {
    const filters = ref<TransactionsFilters>(getDefaultFilters(componentProps().balanceAccountId));
    const insightsCurrency = ref<string | undefined>(undefined);

    watch(
        () => componentProps().balanceAccountId,
        newId => {
            if (newId !== undefined) {
                filters.value.balanceAccountId = newId;
            }
        }
    );

    const transactionsViewState = useTransactionsViewSwitcher(() => ({
        view: componentProps().hideInsights ? TransactionsView.TRANSACTIONS : undefined,
    }));
    const isTransactionsView = computed(() => transactionsViewState.activeView.value !== TransactionsView.INSIGHTS);
    const hasActiveBalanceAccount = computed(() => {
        return componentProps().fetchEnabled && !!filters.value.balanceAccountId;
    });

    const onFiltersChange = (nextFilters: TransactionsFilters) => {
        filters.value = nextFilters;
    };

    const setInsightsCurrency = (currency?: string) => {
        insightsCurrency.value = currency;
    };

    const accountBalancesResult = useTransactionsAccountBalances(() => (hasActiveBalanceAccount.value ? filters.value.balanceAccountId : undefined));

    const transactionsTotalsResult = useTransactionsTotals(() => ({
        filters: filters.value,
        fetchEnabled: isTransactionsView.value && hasActiveBalanceAccount.value,
    }));

    const insightsTotalsResult = useTransactionsTotals(() => ({
        filters: filters.value,
        fetchEnabled: !isTransactionsView.value && hasActiveBalanceAccount.value,
        applicableFilters: INSIGHTS_FILTERS,
    }));

    const transactionsListResult = useTransactionsList(() => ({
        filters: filters.value,
        fetchEnabled: isTransactionsView.value && hasActiveBalanceAccount.value,
        allowLimitSelection: componentProps().allowLimitSelection,
        preferredLimit: componentProps().preferredLimit,
        dataCustomization: componentProps().dataCustomization,
        onFiltersChanged: componentProps().onFiltersChanged,
    }));

    const activeTotals = computed(() => (isTransactionsView.value ? transactionsTotalsResult.totals.value : insightsTotalsResult.totals.value));

    const currenciesLookupResult = useCurrenciesLookup(() => ({
        defaultCurrency: filters.value.balanceAccountId
            ? componentProps().balanceAccounts?.find(account => account.id === filters.value.balanceAccountId)?.defaultCurrencyCode
            : undefined,
        balances: accountBalancesResult.balances.value,
        totals: activeTotals.value,
    }));

    const state = {
        filters,
        insightsCurrency,
        isTransactionsView,
        transactionsViewState,
        onFiltersChange,
        setInsightsCurrency,
        accountBalancesResult,
        transactionsTotalsResult,
        insightsTotalsResult,
        transactionsListResult,
        currenciesLookupResult,
    };

    provide(TRANSACTIONS_OVERVIEW_STATE_KEY, state);
    return state;
}

export function useTransactionsOverviewContext(): TransactionsOverviewStateKey {
    const ctx = inject(TRANSACTIONS_OVERVIEW_STATE_KEY);
    if (!ctx) throw new Error('useTransactionsOverviewContext must be used within TransactionsOverview');
    return ctx;
}
