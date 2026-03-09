<script setup lang="ts">
import InsightsTotals from './InsightsTotals.vue';
import type { ITransactionTotal } from '../types';
import type { CurrencyLookupRecord } from '../composables/useCurrenciesLookup';

const props = defineProps<{
    currency?: string;
    currenciesDictionary: Readonly<Record<string, CurrencyLookupRecord>>;
    isWaiting: boolean;
    error?: Error;
    refresh: () => void;
    totals: readonly Readonly<ITransactionTotal>[];
}>();
</script>

<template>
    <InsightsTotals
        :currency="props.currency"
        :currencies-dictionary="props.currenciesDictionary"
        :is-waiting="props.isWaiting"
        :error="props.error"
        :refresh="props.refresh"
        :totals="props.totals"
    />
</template>
