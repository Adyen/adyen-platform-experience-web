<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import InsightsTotals from '../InsightsTotals/InsightsTotals.vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } from '@integration-components/transactions/domain';

const userEvents = useEventDispatcherContext();
const { insightsCurrency, insightsTotalsResult, currenciesLookupResult } = useTransactionsOverviewContext();

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } as const;

let landedAt: number | undefined;

onMounted(() => {
    landedAt = Date.now();
    userEvents.addEvent?.('Landed on page', sharedAnalyticsProps);
});

onUnmounted(() => {
    if (landedAt !== undefined) {
        userEvents.addEvent?.('Duration on page', { ...sharedAnalyticsProps, duration: Date.now() - landedAt });
    }
});
</script>

<template>
    <InsightsTotals
        :currency="insightsCurrency"
        :currencies-lookup-result="currenciesLookupResult"
        :transactions-totals-result="insightsTotalsResult"
    />
</template>
