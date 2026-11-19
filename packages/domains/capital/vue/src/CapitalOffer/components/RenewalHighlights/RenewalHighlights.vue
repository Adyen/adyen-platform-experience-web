<script setup lang="ts">
import { computed } from 'vue';
import { getRenewalAmountBreakdown, SHARED_CONTRACT_KEYS } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IAmount, IContractType } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import Highlights from '../Highlights/Highlights.vue';
import { CONTRACT_KEYS } from './contractKeys';

const props = defineProps<{
    contractType: IContractType;
    newGrantAmountValue: number;
    remainingGrantAmount: IAmount;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useContractCopy(() => props.contractType);
const items = computed(() => {
    const breakdown = getRenewalAmountBreakdown(props.newGrantAmountValue, props.remainingGrantAmount);
    const formatAmount = (value: number) => i18n.amount(value, breakdown.currency, { minimumFractionDigits: 0 });

    return [
        {
            label: getContractCopy(SHARED_CONTRACT_KEYS.newGrantAmount),
            value: formatAmount(breakdown.newGrantAmountValue),
        },
        {
            align: 'center' as const,
            value: '-',
        },
        {
            label: getContractCopy(CONTRACT_KEYS.currentRemainingGrantAmount),
            value: formatAmount(breakdown.remainingGrantAmountValue),
        },
        {
            align: 'center' as const,
            value: '=',
        },
        {
            label: i18n.get('capital.offer.amountToReceive'),
            value: formatAmount(breakdown.amountToReceive),
        },
    ];
});
</script>

<template>
    <Highlights :items="items" />
</template>
