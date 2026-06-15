<script setup lang="ts">
import { useCoreContext } from '@integration-components/core/vue';
import SummaryItemPair from '../SummaryItemPair/SummaryItemPair.vue';

const props = defineProps<{
    formattedAvailable: string;
    formattedReserved: string;
    isHeader?: boolean;
    widths?: number[];
}>();

const emit = defineEmits<{
    widthsSet: [widths: number[]];
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <div role="listitem" class="adyen-pe-balances__item">
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
