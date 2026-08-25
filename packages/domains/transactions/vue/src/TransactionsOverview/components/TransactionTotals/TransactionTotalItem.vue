<script setup lang="ts">
import { useCoreContext } from '@integration-components/core/vue';
import SummaryItemPair from '../SummaryItemPair/SummaryItemPair.vue';

const props = defineProps<{
    formattedIncomings: string;
    formattedExpenses: string;
    isHeader?: boolean;
    widths?: number[];
}>();

const emit = defineEmits<{
    widthsSet: [widths: number[]];
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <div role="listitem">
        <SummaryItemPair
            :label1="i18n.get('transactions.overview.totals.tags.incoming')"
            :value1="formattedIncomings"
            :tooltip1="props.isHeader ? i18n.get('transactions.overview.totals.tags.incoming.description') : undefined"
            :label2="i18n.get('transactions.overview.totals.tags.outgoing')"
            :value2="formattedExpenses"
            :tooltip2="props.isHeader ? i18n.get('transactions.overview.totals.tags.outgoing.description') : undefined"
            :widths="props.widths"
            @widths-set="emit('widthsSet', $event)"
        />
    </div>
</template>
