<script setup lang="ts">
import SummaryItemPair from '../SummaryItemPair/SummaryItemPair.vue';
import { useTransactionsContext } from '../../../integration/context';

const props = defineProps<{
    formattedAvailable: string;
    formattedReserved: string;
    isHeader?: boolean;
    widths?: number[];
}>();

const emit = defineEmits<{
    widthsSet: [widths: number[]];
}>();

const { i18n } = useTransactionsContext();
</script>

<template>
    <div role="listitem">
        <SummaryItemPair
            :label1="i18n.get('transactions.overview.balances.tags.available')"
            :value1="formattedAvailable"
            :label2="i18n.get('transactions.overview.balances.tags.reserved')"
            :value2="formattedReserved"
            :tooltip2="props.isHeader ? i18n.get('transactions.overview.balances.tags.reserved.description') : undefined"
            :widths="props.widths"
            @widths-set="emit('widthsSet', $event)"
        />
    </div>
</template>
