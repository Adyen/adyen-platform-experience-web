<script setup lang="ts">
import { computed } from 'vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFinancingDetailItems, type FinancingDetailItemKey } from '../composables/useFinancingDetailItems';
import FinancingDetailList from './FinancingDetailList/FinancingDetailList.vue';
import { BentoCard } from '@adyen/bento-vue3';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';

const props = defineProps<{
    hasExpectedRepaymentPeriod: boolean;
    offer: IGrantOfferResponseDTO;
}>();

const { getContractCopy } = useCapitalCopy();
const { getItems } = useFinancingDetailItems(props.offer.contractType);
const itemKeys = computed(
    () =>
        [
            'fees',
            'totalRepaymentAmount',
            'dailyRepaymentRate',
            ...(props.hasExpectedRepaymentPeriod ? ['expectedRepaymentPeriod'] : []),
            ...(props.offer.contractType === 'loan' ? ['maximumRepaymentDate'] : []),
        ] as FinancingDetailItemKey[]
);
const items = computed(() => getItems(props.offer, itemKeys.value));
</script>

<template>
    <BentoCard background="secondary">
        {{ getContractCopy('capital.offer.termsTitle', props.offer.contractType) }}
        <template #content>
            <FinancingDetailList :items="items" />
        </template>
    </BentoCard>
</template>
