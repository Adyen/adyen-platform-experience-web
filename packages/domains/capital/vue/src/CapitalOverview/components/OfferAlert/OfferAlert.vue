<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IDynamicOffersConfig } from '@integration-components/types';
import styles from './OfferAlert.module.scss';

const props = defineProps<{
    dynamicOfferConfig: IDynamicOffersConfig;
    hasGrants: boolean;
    isEarlyRenewal: boolean;
    onOfferRequest: () => void;
}>();

const { i18n } = useCoreContext();

const title = computed(() => {
    const maxAmount = props.dynamicOfferConfig.maxAmount;
    const options = { values: { amount: i18n.amount(maxAmount.value, maxAmount.currency, { minimumFractionDigits: 0 }) } };
    return i18n.get(props.hasGrants ? 'capital.overview.grants.newGrant.title' : 'capital.overview.prequalified.alreadyQualifyInfo', options);
});

const description = computed(() => {
    return props.isEarlyRenewal ? i18n.get('capital.overview.grants.newGrant.earlyRenewalNotice') : undefined;
});

const buttonLabel = computed(() => {
    return i18n.get(props.hasGrants ? 'capital.overview.grants.newGrant.actions.newGrant' : 'capital.overview.prequalified.actions.seeOptions');
});
</script>

<template>
    <div :class="styles.root">
        <BentoAlert type="highlight">
            {{ title }}
            <template #description>
                {{ description }}
            </template>
        </BentoAlert>
        <BentoButton @click="props.onOfferRequest">
            {{ buttonLabel }}
        </BentoButton>
    </div>
</template>
