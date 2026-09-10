<script setup lang="ts">
import { computed } from 'vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFinancingDetailItems, type FinancingDetailItemKey } from '../composables/useFinancingDetailItems';
import FinancingDetailList from './FinancingDetailList/FinancingDetailList.vue';
import { BentoCard } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';

const props = defineProps<{
    hasExpectedRepaymentPeriod: boolean;
    offer: IGrantOfferResponseDTO;
}>();

const { i18n } = useCoreContext();
const { getItems } = useFinancingDetailItems();
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
        {{ i18n.get('capital.common.termsTitle') }}
        <template #content>
            <FinancingDetailList :items="items" />
        </template>
    </BentoCard>
</template>
