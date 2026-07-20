<script setup lang="ts">
import type { PaymentLinkCreationExternalProps } from './types';
import { UIElementProvider } from '@integration-components/core/vue';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PaymentLinkCreationExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinkCreation">
        <PaymentLinkCreationContainer
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
