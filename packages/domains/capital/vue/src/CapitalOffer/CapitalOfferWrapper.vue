<script setup lang="ts">
import type { CapitalOfferExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import CapitalOffer from './components/CapitalOffer.vue';

const props = defineProps<CapitalOfferExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="capitalOffer" :refresh-component="refresh">
        <CapitalOffer
            :key="refreshCount"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :on-offer-dismiss="props.onOfferDismiss"
            :on-funds-request="props.onFundsRequest"
        />
    </UIElementProvider>
</template>
