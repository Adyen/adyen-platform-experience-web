<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { PaymentLinkCreationFormValues, PaymentLinksOverviewModalType } from '@integration-components/payByLink/domain';
import type { PaymentLinksOverviewExternalProps } from '../types';

const props = defineProps<{
    modalType: PaymentLinksOverviewModalType;
    storeIds?: PaymentLinksOverviewExternalProps['storeIds'];
    paymentLinkCreation?: PaymentLinksOverviewExternalProps['paymentLinkCreation'];
    paymentLinkSettings?: PaymentLinksOverviewExternalProps['paymentLinkSettings'];
    onPaymentLinkCreated: (paymentLink: PaymentLinkCreationFormValues) => void;
    onContactSupport?: () => void;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();
const PaymentLinkCreation = defineAsyncComponent({
    loader: () => import('../../PaymentLinkCreation/components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
const PaymentLinkSettings = defineAsyncComponent({
    loader: () => import('../../PaymentLinkSettings/components/PaymentLinkSettingsContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
</script>

<template>
    <BentoModal :is-open="true" size="large" :is-dismissible="true" :aria-label="i18n.get('payByLink.overview.title')" @close-modal="props.onClose">
        <template #content>
            <PaymentLinkCreation
                v-if="props.modalType === 'Creation'"
                :fields-config="props.paymentLinkCreation?.fieldsConfig"
                :store-ids="props.storeIds"
                :on-payment-link-created="props.onPaymentLinkCreated"
                :on-creation-dismiss="props.paymentLinkCreation?.onCreationDismiss"
                :on-contact-support="props.onContactSupport"
                embedded-in-overview
            />
            <PaymentLinkSettings
                v-else
                v-bind="props.paymentLinkSettings"
                :store-ids="props.storeIds"
                :on-contact-support="props.onContactSupport"
                embedded-in-overview
            />
        </template>
    </BentoModal>
</template>
