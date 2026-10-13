<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';

const props = defineProps<{
    id: string;
    onContactSupport?: () => void;
    onClose: () => void;
    onUpdate: () => void;
}>();

const { i18n } = useCoreContext();
const PaymentLinkDetails = defineAsyncComponent({
    loader: () => import('../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
</script>

<template>
    <BentoModal :is-open="true" size="large" :is-dismissible="true" :aria-label="i18n.get('payByLink.details.title')" @close-modal="props.onClose">
        <template #content>
            <ModalContextProvider>
                <PaymentLinkDetails
                    :id="props.id"
                    :on-contact-support="props.onContactSupport"
                    :on-dismiss="props.onClose"
                    :on-update="props.onUpdate"
                    is-dismiss-button-hidden
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
