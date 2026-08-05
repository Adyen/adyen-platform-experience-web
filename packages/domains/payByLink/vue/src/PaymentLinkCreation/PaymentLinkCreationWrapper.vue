<script setup lang="ts">
import type { PaymentLinkCreationExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';

const props = defineProps<PaymentLinkCreationExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinkCreation" :refresh-component="refresh">
        <PaymentLinkCreationContainer
            :key="refreshCount"
            :fields-config="props.fieldsConfig"
            :store-ids="props.storeIds"
            :hide-title="props.hideTitle"
            :on-payment-link-created="props.onPaymentLinkCreated"
            :on-creation-dismiss="props.onCreationDismiss"
            :on-contact-support="props.onContactSupport"
            :on-show-details="props.onShowDetails"
        />
    </UIElementProvider>
</template>
