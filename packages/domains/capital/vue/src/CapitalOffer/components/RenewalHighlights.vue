<script setup lang="ts">
import { computed } from 'vue';
import { getRenewalAmountBreakdown } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IAmount, IContractType } from '@integration-components/types';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';
import Highlights from './Highlights/Highlights.vue';

const props = defineProps<{
    contractType?: IContractType;
    newGrantAmountValue: number;
    remainingGrantAmount: IAmount;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const items = computed(() => {
    const breakdown = getRenewalAmountBreakdown(props.newGrantAmountValue, props.remainingGrantAmount);
    const formatAmount = (value: number) => i18n.amount(value, breakdown.currency, { minimumFractionDigits: 0 });

    return [
        {
            label: getContractCopy('capital.offer.renewalFields.newGrantAmount', props.contractType),
            value: formatAmount(breakdown.newGrantAmountValue),
        },
        {
            align: 'center' as const,
            value: '-',
        },
        {
            label: getContractCopy('capital.offer.renewalFields.currentGrantAmount', props.contractType),
            value: formatAmount(breakdown.remainingGrantAmountValue),
        },
        {
            align: 'center' as const,
            value: '=',
        },
        {
            label: i18n.get('capital.offer.renewalFields.amountToReceive'),
            value: formatAmount(breakdown.amountToReceive),
        },
    ];
});
</script>

<template>
    <Highlights :items="items" />
</template>
