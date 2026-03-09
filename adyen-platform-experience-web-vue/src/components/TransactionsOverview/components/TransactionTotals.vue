<script setup lang="ts">
import { useCoreContext } from '../../../core/Context';
import TotalsCard from './TotalsCard.vue';
import type { ITransactionTotal } from '../types';

const props = defineProps<{
    totals: readonly Readonly<ITransactionTotal>[];
    loadingTotals: boolean;
}>();

const { i18n } = useCoreContext();

const BASE_CLASS = 'adyen-pe-transaction-totals';
</script>

<template>
    <div :class="BASE_CLASS">
        <!-- TODO: Add responsive container logic for xs breakpoint -->
        <TotalsCard :aria-label="i18n.get('transactions.overview.totals.labels.default')" :totals="props.totals" :is-loading="props.loadingTotals" />
    </div>
</template>
