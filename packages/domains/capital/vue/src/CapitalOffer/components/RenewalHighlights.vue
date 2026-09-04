<script setup lang="ts">
import { computed } from 'vue';
import { getRenewalAmountBreakdown } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IAmount } from '@integration-components/types';
import Highlights from './Highlights/Highlights.vue';

const props = defineProps<{
    newGrantAmountValue: number;
    remainingGrantAmount: IAmount;
}>();

const { i18n } = useCoreContext();
const items = computed(() => {
    const breakdown = getRenewalAmountBreakdown(props.newGrantAmountValue, props.remainingGrantAmount);
    const formatAmount = (value: number) => i18n.amount(value, breakdown.currency, { minimumFractionDigits: 0 });

    return [
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.newGrantAmount'),
            value: formatAmount(breakdown.newGrantAmountValue),
        },
        { value: '-' },
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.currentGrantAmount'),
            value: formatAmount(breakdown.remainingGrantAmountValue),
        },
        { value: '=' },
        {
            label: i18n.get('capital.offer.selection.earlyRenewal.amountToReceive'),
            value: formatAmount(breakdown.amountToReceive),
        },
    ];
});
</script>

<template>
    <Highlights :items="items" />
</template>
