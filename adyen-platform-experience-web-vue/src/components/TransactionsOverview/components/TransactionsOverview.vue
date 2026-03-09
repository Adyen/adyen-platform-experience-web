<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import { BentoSegmentedControl } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import TransactionsOverviewList from './TransactionsOverviewList.vue';
import TransactionsOverviewInsights from './TransactionsOverviewInsights.vue';
import TransactionFilters from './TransactionFilters.vue';
import TransactionsExport from './TransactionsExport.vue';
import { useTransactionsViewSwitcher } from '../composables/useTransactionsViewSwitcher';
import { useTransactionsList } from '../composables/useTransactionsList';
import { useTransactionsTotals } from '../composables/useTransactionsTotals';
import { useAccountBalances } from '../composables/useAccountBalances';
import { useCurrenciesLookup } from '../composables/useCurrenciesLookup';
import { classes, INITIAL_FILTERS } from '../constants';
import { TransactionsView } from '../types';
import type { IBalanceAccountBase, TransactionsFilters as Filters } from '../types';
import '../styles/index.scss';

const props = defineProps<{
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onRecordSelection?: (record: { id: string }) => void;
    showDetails?: boolean;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (...args: any[]) => void;
    dataCustomization?: any;
    balanceAccounts: IBalanceAccountBase[] | undefined;
    isLoadingBalanceAccount: boolean;
}>();

const { i18n } = useCoreContext();

// ── State ──
const filters = shallowRef<Readonly<Filters>>({ ...INITIAL_FILTERS });
const lastFiltersChangeTimestamp = ref(Date.now());
const insightsCurrency = ref<string | undefined>();

// Auto-set insightsCurrency to the balance account's default currency (mirrors React useCurrencySelection behavior)
watch(
    () => filters.value.balanceAccount,
    account => {
        if (account?.defaultCurrencyCode) {
            insightsCurrency.value = account.defaultCurrencyCode;
        }
    },
    { immediate: true }
);

// ── View switcher ──
const { activeView, onViewChange, viewTabs } = useTransactionsViewSwitcher();
const isTransactionsView = computed(() => activeView.value !== TransactionsView.INSIGHTS);
const hasActiveBalanceAccount = computed(() => !!filters.value.balanceAccount?.id);

const segmentedControlItems = computed(() =>
    viewTabs.value.map(tab => ({
        label: i18n.get(tab.label),
        value: tab.id,
    }))
);

// ── Filter change handler ──
function onFiltersChange(newFilters: Readonly<Filters>) {
    lastFiltersChangeTimestamp.value = Date.now();
    filters.value = newFilters;
}

// ── Account balances ──
const accountBalancesResult = useAccountBalances(() => ({
    balanceAccount: filters.value.balanceAccount,
}));

// ── Insights totals ──
const INSIGHTS_FILTERS_SET = new Set<keyof Filters>(['balanceAccount', 'createdDate']);
const insightsTotalsResult = useTransactionsTotals(() => ({
    fetchEnabled: !isTransactionsView.value && hasActiveBalanceAccount.value,
    getQueryParams: ({ balanceAccountId, createdSince, createdUntil }) => ({ balanceAccountId, createdSince, createdUntil }),
    applicableFilters: INSIGHTS_FILTERS_SET,
    now: lastFiltersChangeTimestamp.value,
    filters: filters.value as Filters,
}));

// ── Transaction totals ──
const transactionsTotalsResult = useTransactionsTotals(() => ({
    fetchEnabled: isTransactionsView.value && hasActiveBalanceAccount.value,
    getQueryParams: allQueryParams => allQueryParams,
    now: lastFiltersChangeTimestamp.value,
    filters: filters.value as Filters,
}));

// ── Transactions list ──
const transactionsListResult = useTransactionsList(() => ({
    fetchEnabled: hasActiveBalanceAccount.value,
    now: lastFiltersChangeTimestamp.value,
    allowLimitSelection: props.allowLimitSelection,
    dataCustomization: props.dataCustomization,
    onFiltersChanged: props.onFiltersChanged,
    preferredLimit: props.preferredLimit,
    filters: filters.value as Filters,
}));

// ── Currencies lookup ──
const activeTotalsResult = computed(() => (isTransactionsView.value ? transactionsTotalsResult : insightsTotalsResult));

const currenciesLookupResult = useCurrenciesLookup(() => ({
    defaultCurrency: filters.value.balanceAccount?.defaultCurrencyCode,
    balances: accountBalancesResult.balances.value,
    totals: activeTotalsResult.value.totals.value,
}));

// ── Sorted data for list view ──
const sortedBalances = computed(() =>
    currenciesLookupResult.defaultCurrencySortedCurrencies.value.map(
        currency => currenciesLookupResult.currenciesDictionary.value[currency]!.balances
    )
);

const sortedTotals = computed(() =>
    currenciesLookupResult.defaultCurrencySortedCurrencies.value.map(currency => currenciesLookupResult.currenciesDictionary.value[currency]!.totals)
);
</script>

<template>
    <div :class="classes.root">
        <!-- Header -->
        <div v-if="!props.hideTitle" class="adyen-pe-transactions-overview-header">
            <h2>{{ i18n.get('transactions.overview.title') }}</h2>
            <bento-segmented-control
                v-if="segmentedControlItems.length > 1"
                :items="segmentedControlItems"
                :model-value="activeView"
                :aria-label="i18n.get('transactions.overview.viewSelect.a11y.label')"
                @update:model-value="(val: string | number) => onViewChange({ id: val as TransactionsView })"
            />
        </div>

        <!-- Toolbar: Filters + Export -->
        <div role="toolbar" :class="classes.toolbar">
            <TransactionFilters
                :available-currencies="currenciesLookupResult.sortedCurrencies.value"
                :balance-accounts="props.balanceAccounts"
                :is-transactions-view="isTransactionsView"
                :insights-currency="insightsCurrency"
                :set-insights-currency="
                    (c?: string) => {
                        insightsCurrency = c;
                    }
                "
                :on-change="onFiltersChange"
            />
            <TransactionsExport
                v-if="isTransactionsView"
                :disabled="!transactionsListResult.records.value?.length"
                :filters="filters as Filters"
                :now="lastFiltersChangeTimestamp"
            />
        </div>

        <!-- Content: List or Insights view -->
        <TransactionsOverviewList
            v-if="isTransactionsView"
            :balance-account="filters.balanceAccount"
            :balance-accounts="props.balanceAccounts"
            :is-loading-balance-account="props.isLoadingBalanceAccount"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :show-details="props.showDetails"
            :balances-error="accountBalancesResult.error.value"
            :loading-balances="accountBalancesResult.isWaiting.value"
            :sorted-balances="sortedBalances"
            :balances-can-refresh="accountBalancesResult.canRefresh.value"
            :balances-refresh="accountBalancesResult.refresh"
            :totals-error="transactionsTotalsResult.error.value"
            :loading-totals="transactionsTotalsResult.isWaiting.value"
            :sorted-totals="sortedTotals"
            :totals-can-refresh="transactionsTotalsResult.canRefresh.value"
            :totals-refresh="transactionsTotalsResult.refresh"
            :currencies-sorted-currencies="currenciesLookupResult.sortedCurrencies.value"
            :transactions-error="transactionsListResult.error.value"
            :transactions-fetching="transactionsListResult.fetching.value"
            :transactions="transactionsListResult.records.value"
            :has-next="transactionsListResult.hasNext.value"
            :has-previous="transactionsListResult.hasPrevious.value"
            :go-to-next-page="transactionsListResult.goToNextPage"
            :go-to-previous-page="transactionsListResult.goToPreviousPage"
            :limit="transactionsListResult.limit.value"
            :limit-options="transactionsListResult.limitOptions.value"
            :update-limit="transactionsListResult.updateLimit"
            :current-page="transactionsListResult.page.value + 1"
        />

        <TransactionsOverviewInsights
            v-else
            :currency="insightsCurrency"
            :currencies-dictionary="currenciesLookupResult.currenciesDictionary.value"
            :is-waiting="insightsTotalsResult.isWaiting.value"
            :error="insightsTotalsResult.error.value"
            :refresh="insightsTotalsResult.refresh"
            :totals="insightsTotalsResult.totals.value"
        />
    </div>
</template>
