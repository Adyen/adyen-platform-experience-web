<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import TransactionTotals from '../TransactionTotals/TransactionTotals.vue';
import Balances from '../Balances/Balances.vue';
import TransactionsTable from '../TransactionsTable/TransactionsTable.vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '@integration-components/transactions/domain';
import type { ITransaction } from '@integration-components/types';
import type { IBalanceAccountBase, TransactionsOverviewExternalProps } from '../../types';
import { BREAKPOINTS } from '@integration-components/utils';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    isLoadingBalanceAccount: boolean;
    onContactSupport?: () => void;
    onRecordSelection?: TransactionsOverviewExternalProps['onRecordSelection'];
    showDetails?: boolean;
    dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    onRowClick: (transaction: ITransaction) => void;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const { filters, currenciesLookupResult, accountBalancesResult, transactionsTotalsResult, transactionsListResult } = useTransactionsOverviewContext();

const { currenciesDictionary, defaultCurrencySortedCurrencies, sortedCurrencies } = currenciesLookupResult;

const sortedBalances = computed(() => defaultCurrencySortedCurrencies.value.map(c => currenciesDictionary.value[c]!.balances));
const sortedTotals = computed(() => defaultCurrencySortedCurrencies.value.map(c => currenciesDictionary.value[c]!.totals));

const loadingTotals = computed(() => transactionsTotalsResult.isWaiting.value);
const loadingBalances = computed(() => accountBalancesResult.isFetching.value);
const totalsError = computed(() => transactionsTotalsResult.error.value);
const balancesError = computed(() => accountBalancesResult.error.value);

const activeBalanceAccount = computed(() => props.balanceAccounts?.find(a => a.id === filters.value.balanceAccountId));

const loadingTable = computed(() => transactionsListResult.fetching.value || props.isLoadingBalanceAccount || !props.balanceAccounts);

const availableCurrencies = computed(() => sortedCurrencies.value as string[]);

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } as const;

const summaryEl = ref<HTMLElement | null>(null);
const totalsSectionEl = ref<HTMLElement | null>(null);
const balancesSectionEl = ref<HTMLElement | null>(null);

let landedAt: number | undefined;

function updateSummaryLayout() {
    const totalsHeight = totalsSectionEl.value?.clientHeight ?? 0;
    const balancesHeight = balancesSectionEl.value?.clientHeight ?? 0;
    const maxHeight = Math.max(totalsHeight, balancesHeight);
    summaryEl.value?.style.setProperty('--adyen-pe-summary-height', `${maxHeight}px`);
}

watch([totalsError, balancesError], ([newTotalsError, newBalancesError], [oldTotalsError, oldBalancesError]) => {
    const isMdUp = (summaryEl.value?.clientWidth ?? 0) >= BREAKPOINTS.md;

    // Before the DOM updates, capture the width of sections that are about to switch to an alert
    const totalsWidth = isMdUp && !oldTotalsError && newTotalsError ? balancesSectionEl.value?.offsetWidth : undefined;
    const balancesWidth = isMdUp && !oldBalancesError && newBalancesError ? totalsSectionEl.value?.offsetWidth : undefined;

    nextTick(() => {
        if (totalsWidth !== undefined) {
            totalsSectionEl.value?.style.setProperty('min-width', `${totalsWidth}px`);
        } else if (!newTotalsError) {
            totalsSectionEl.value?.style.removeProperty('min-width');
        }

        if (balancesWidth !== undefined) {
            balancesSectionEl.value?.style.setProperty('min-width', `${balancesWidth}px`);
        } else if (!newBalancesError) {
            balancesSectionEl.value?.style.removeProperty('min-width');
        }

        updateSummaryLayout();
    });
});

onMounted(() => {
    landedAt = Date.now();
    userEvents.addEvent?.('Landed on page', sharedAnalyticsProps);

    updateSummaryLayout();
});

onUnmounted(() => {
    if (landedAt !== undefined) {
        userEvents.addEvent?.('Duration on page', { ...sharedAnalyticsProps, duration: Date.now() - landedAt });
    }
});
</script>

<template>
    <div ref="summaryEl" class="adyen-pe-transactions-overview__summary">
        <div ref="totalsSectionEl" class="adyen-pe-transactions-overview__summary-section adyen-pe-transactions-overview__summary-section--totals">
            <BentoAlert v-if="totalsError" type="warning">
                <template #default>{{ i18n.get('transactions.overview.totals.error') }}</template>
                <template #actions>
                    <BentoButton variant="tertiary" :disabled="!transactionsTotalsResult.canRefresh.value" @click="transactionsTotalsResult.refresh">
                        {{ i18n.get('common.actions.refresh.labels.default') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <TransactionTotals v-else :totals="sortedTotals" :loading-totals="loadingTotals" />
        </div>
        <div
            ref="balancesSectionEl"
            class="adyen-pe-transactions-overview__summary-section adyen-pe-transactions-overview__summary-section--balances"
        >
            <BentoAlert v-if="balancesError" type="warning">
                <template #default>{{ i18n.get('transactions.overview.balances.error') }}</template>
            </BentoAlert>
            <Balances v-else :balances="sortedBalances" :loading-balances="loadingBalances" />
        </div>
    </div>

    <TransactionsTable
        :active-balance-account="activeBalanceAccount"
        :available-currencies="availableCurrencies"
        :error="transactionsListResult.error.value as any"
        :has-multiple-currencies="availableCurrencies.length > 1"
        :loading="loadingTable"
        :on-contact-support="props.onContactSupport"
        :on-row-click="props.onRowClick"
        :show-details="props.showDetails"
        :transactions="transactionsListResult.records.value"
        :custom-columns="transactionsListResult.fields.value"
        :has-next="transactionsListResult.hasNext.value"
        :has-previous="transactionsListResult.hasPrevious.value"
        :go-to-next-page="transactionsListResult.goToNextPage"
        :go-to-previous-page="transactionsListResult.goToPreviousPage"
        :limit="transactionsListResult.limit.value"
        :limit-options="transactionsListResult.limitOptions.value"
        :update-limit="transactionsListResult.updateLimit"
        :current-page="transactionsListResult.page.value + 1"
    />
</template>
