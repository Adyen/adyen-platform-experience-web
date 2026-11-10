<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IDynamicOffersConfig } from '@integration-components/types';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';

const props = defineProps<{
    dynamicOfferConfig: IDynamicOffersConfig;
    hasGrants: boolean;
    isEarlyRenewal: boolean;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const contractType = computed(() => props.dynamicOfferConfig.contractType);

const title = computed(() => {
    const maxAmount = props.dynamicOfferConfig.maxAmount;
    const options = { values: { amount: i18n.amount(maxAmount.value, maxAmount.currency, { minimumFractionDigits: 0 }) } };
    return getContractCopy(
        props.hasGrants ? 'capital.overview.offerAlert.newGrantTitle' : 'capital.overview.offerAlert.firstGrantTitle',
        contractType.value,
        options
    );
});

const description = computed(() => {
    return props.isEarlyRenewal ? getContractCopy('capital.overview.offerAlert.renewalDescription', contractType.value) : undefined;
});
</script>

<template>
    <BentoAlert type="highlight">
        {{ title }}
        <template v-if="description" #description>
            {{ description }}
        </template>
    </BentoAlert>
</template>
