<script setup lang="ts">
import { computed } from 'vue';
import type { IContractType, IOffer } from '@integration-components/types';
import { useFinancingDetailItems, type FinancingDetailItemKey } from '../composables/useFinancingDetailItems';
import FinancingDetailList from './FinancingDetailList/FinancingDetailList.vue';
import { BentoCard } from '@adyen/bento-vue3';
import { useContractCopy } from '../../shared/composables/useContractCopy';
import { SHARED_CONTRACT_KEYS } from '@integration-components/capital/domain';

const props = defineProps<{
    contractType: IContractType;
    hasExpectedRepaymentPeriod: boolean;
    offer: IOffer;
}>();

const { getContractCopy } = useContractCopy(() => props.contractType);
const { getItems } = useFinancingDetailItems(() => props.contractType);
const itemKeys = computed(
    () =>
        [
            'fees',
            'totalRepaymentAmount',
            'dailyRepaymentRate',
            ...(props.hasExpectedRepaymentPeriod ? ['expectedRepaymentPeriod'] : []),
            'maximumRepaymentDate',
        ] as FinancingDetailItemKey[]
);
const items = computed(() => getItems(props.offer, itemKeys.value));
</script>

<template>
    <BentoCard background="secondary">
        {{ getContractCopy(SHARED_CONTRACT_KEYS.termsTitle) }}
        <template #content>
            <FinancingDetailList :items="items" />
        </template>
    </BentoCard>
</template>
