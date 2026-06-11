<script setup lang="ts">
import InsightsTotals from '../InsightsTotals/InsightsTotals.vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } from '@integration-components/transactions/domain';
import { useLandedPageEvent, useDurationEvent } from '@integration-components/composables-vue';

const { insightsCurrency, insightsTotalsResult, currenciesLookupResult } = useTransactionsOverviewContext();

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } as const;

useLandedPageEvent(sharedAnalyticsProps);
useDurationEvent(sharedAnalyticsProps);
</script>

<template>
    <InsightsTotals
        :currency="insightsCurrency"
        :currencies-lookup-result="currenciesLookupResult"
        :transactions-totals-result="insightsTotalsResult"
    />
</template>
