<script setup lang="ts">
import InsightsTotals from '../InsightsTotals/InsightsTotals.vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { useTransactionsViewEvents } from '../../composables/useTransactionsViewEvents';

const { insightsCurrency, insightsTotalsResult, currenciesLookupResult } = useTransactionsOverviewContext();

useTransactionsViewEvents('insights');
</script>

<template>
    <InsightsTotals
        :currency="insightsCurrency"
        :currencies-lookup-result="currenciesLookupResult"
        :transactions-totals-result="insightsTotalsResult"
    />
</template>
