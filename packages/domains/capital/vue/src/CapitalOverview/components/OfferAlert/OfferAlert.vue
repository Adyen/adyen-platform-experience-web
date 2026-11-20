<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IDynamicOffersConfig } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import { CONTRACT_KEYS } from './contractKeys';

const props = defineProps<{
    dynamicOfferConfig: IDynamicOffersConfig;
    hasGrants: boolean;
    isEarlyRenewal: boolean;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useContractCopy(() => props.dynamicOfferConfig.contractType);

const title = computed(() => {
    const maxAmount = props.dynamicOfferConfig.maxAmount;
    const options = { values: { amount: i18n.amount(maxAmount.value, maxAmount.currency, { minimumFractionDigits: 0 }) } };
    return getContractCopy(props.hasGrants ? CONTRACT_KEYS.newGrantTitle : CONTRACT_KEYS.firstGrantTitle, options);
});
</script>

<template>
    <BentoAlert type="highlight">
        {{ title }}
        <template v-if="props.isEarlyRenewal" #description>
            {{ getContractCopy(CONTRACT_KEYS.renewalDescription) }}
        </template>
    </BentoAlert>
</template>
