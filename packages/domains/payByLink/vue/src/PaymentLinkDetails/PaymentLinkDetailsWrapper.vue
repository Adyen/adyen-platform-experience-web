<script setup lang="ts">
import type { PaymentLinkDetailsExternalProps } from './types';
import { UIElementProvider } from '@integration-components/core/vue';
import PaymentLinkDetails from './components/PaymentLinkDetails/PaymentLinkDetails.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PaymentLinkDetailsExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinkDetails">
        <PaymentLinkDetails
            :id="props.id"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :on-dismiss="props.onDismiss"
            :on-update="props.onUpdate"
        />
    </UIElementProvider>
</template>
