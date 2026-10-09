<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useLandedPageEvent, useDurationEvent } from '@integration-components/composables-vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import TransactionTotals from '../TransactionTotals/TransactionTotals.vue';
import Balances from '../Balances/Balances.vue';
import TransactionsTable from '../TransactionsTable/TransactionsTable.vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '@integration-components/transactions/domain';
import type { ITransaction } from '@integration-components/types';
import type { IBalanceAccountBase, TransactionsOverviewExternalProps } from '../../types';
import styles from '../TransactionsOverview/TransactionsOverview.module.scss';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    isLoadingBalanceAccount: boolean;
    onContactSupport?: () => void;
    onRecordSelection?: TransactionsOverviewExternalProps['onRecordSelection'];
    dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    onRowClick: (transaction: ITransaction) => void;
}>();

const { i18n } = useCoreContext();
const { filters, currenciesLookupResult, accountBalancesResult, transactionsTotalsResult, transactionsListResult } = useTransactionsOverviewContext();

const { currenciesDictionary, defaultCurrencySortedCurrencies, sortedCurrencies } = currenciesLookupResult;

const sortedBalances = computed(() => defaultCurrencySortedCurrencies.value.map(c => currenciesDictionary.value[c]!.balances));
const sortedTotals = computed(() => defaultCurrencySortedCurrencies.value.map(c => currenciesDictionary.value[c]!.totals));

const loadingTotals = computed(() => transactionsTotalsResult.isWaiting.value || props.isLoadingBalanceAccount);
const loadingBalances = computed(() => accountBalancesResult.isFetching.value || props.isLoadingBalanceAccount);
const totalsError = computed(() => transactionsTotalsResult.error.value);
const balancesError = computed(() => accountBalancesResult.error.value);

const activeBalanceAccount = computed(() => props.balanceAccounts?.find(a => a.id === filters.value.balanceAccountId));

const loadingTable = computed(() => transactionsListResult.fetching.value || props.isLoadingBalanceAccount || !props.balanceAccounts);

const availableCurrencies = computed(() => sortedCurrencies.value as string[]);

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } as const;

const summaryEl = ref<HTMLElement | null>(null);
const totalsSectionEl = ref<HTMLElement | null>(null);
const balancesSectionEl = ref<HTMLElement | null>(null);

useLandedPageEvent(sharedAnalyticsProps);
useDurationEvent(sharedAnalyticsProps);

function updateSummaryLayout() {
    const totalsHeight = totalsSectionEl.value?.clientHeight ?? 0;
    const balancesHeight = balancesSectionEl.value?.clientHeight ?? 0;
    const maxHeight = Math.max(totalsHeight, balancesHeight);
    summaryEl.value?.style.setProperty('--adyen-pe-summary-height', `${maxHeight}px`);
}

// A retry clears the error before it settles, so the card comes back into view mid-fetch. Showing
// its loading state there would collapse the column onto its min-width and then expand it again,
// so the card keeps the figures it already has until the retry resolves, one way or the other.
function useRetryTracker(error: () => unknown, loading: () => boolean) {
    const errored = ref(false);

    watch([error, loading], ([currentError, isLoading]) => {
        if (currentError) errored.value = true;
        else if (!isLoading) errored.value = false;
    });

    return computed(() => errored.value && !error());
}

const totalsRetrying = useRetryTracker(
    () => totalsError.value,
    () => loadingTotals.value
);

const balancesRetrying = useRetryTracker(
    () => balancesError.value,
    () => loadingBalances.value
);

watch([totalsError, balancesError, totalsRetrying, balancesRetrying], () => {
    nextTick(updateSummaryLayout);
});

onMounted(() => {
    updateSummaryLayout();
});
</script>

<template>
    <div ref="summaryEl" :class="styles.summary">
        <div ref="totalsSectionEl" :class="[styles.summarySection, styles.summarySectionTotals]">
            <BentoAlert v-if="totalsError" type="warning">
                <template #default>
                    {{ i18n.get('transactions.overview.totals.error') }}
                </template>
                <template #actions>
                    <BentoButton variant="tertiary" :disabled="!transactionsTotalsResult.canRefresh.value" @click="transactionsTotalsResult.refresh">
                        {{ i18n.get('transactions.common.actions.refresh.labels.default') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <div :class="totalsError ? styles.summaryReservedWidth : ''" :inert="totalsError ? true : undefined">
                <TransactionTotals :totals="sortedTotals" :loading-totals="loadingTotals && !totalsRetrying" />
            </div>
        </div>
        <div ref="balancesSectionEl" :class="[styles.summarySection, styles.summarySectionBalances]">
            <BentoAlert v-if="balancesError" type="warning">
                <template #default>
                    {{ i18n.get('transactions.overview.balances.error') }}
                </template>
                <template #actions>
                    <BentoButton variant="tertiary" :disabled="!accountBalancesResult.canRefresh.value" @click="accountBalancesResult.refresh">
                        {{ i18n.get('transactions.common.actions.refresh.labels.default') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <div :class="balancesError ? styles.summaryReservedWidth : ''" :inert="balancesError ? true : undefined">
                <Balances :balances="sortedBalances" :loading-balances="loadingBalances && !balancesRetrying" />
            </div>
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
