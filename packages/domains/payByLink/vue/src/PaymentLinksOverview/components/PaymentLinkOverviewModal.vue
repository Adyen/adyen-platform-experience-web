<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { PaymentLinkCreationFormValues, PaymentLinksOverviewModalType } from '@integration-components/payByLink/domain';
import type { PaymentLinksOverviewComponentProps } from '../types';

const props = defineProps<{
    modalType: PaymentLinksOverviewModalType;
    storeIds?: PaymentLinksOverviewComponentProps['storeIds'];
    paymentLinkCreation?: PaymentLinksOverviewComponentProps['paymentLinkCreation'];
    paymentLinkSettings?: PaymentLinksOverviewComponentProps['paymentLinkSettings'];
    onCreate: (paymentLink: PaymentLinkCreationFormValues) => void;
    onContactSupport?: PaymentLinksOverviewComponentProps['onContactSupport'];
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
        <!-- Keep this default slot empty — needed for no padding -->
        <template #default />
        <template #content>
            <PaymentLinkCreation
                v-if="props.modalType === 'Creation'"
                :fields-config="props.paymentLinkCreation?.fieldsConfig"
                :store-ids="props.storeIds"
                :on-create="props.onCreate"
                :on-dismiss="props.paymentLinkCreation?.onDismiss"
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
