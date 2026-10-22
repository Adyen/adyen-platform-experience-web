<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
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
const modalTitleKey = ref<TranslationKey>();
const modalTitle = computed(() => (modalTitleKey.value ? i18n.get(modalTitleKey.value) : undefined));

watch(
    () => props.modalType,
    modalType => {
        modalTitleKey.value = modalType === 'Creation' ? 'payByLink.creation.form.title' : 'payByLink.settings.title';
    },
    { immediate: true }
);

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
    <BentoModal
        :is-open="true"
        size="large"
        :is-dismissible="true"
        :aria-label="modalTitle ?? i18n.get('payByLink.overview.title')"
        @close-modal="props.onClose"
    >
        <template #default>{{ modalTitle }}</template>
        <template #content>
            <ModalContextProvider>
                <PaymentLinkCreation
                    v-if="props.modalType === 'Creation'"
                    :fields-config="props.paymentLinkCreation?.fieldsConfig"
                    :store-ids="props.storeIds"
                    :on-create="props.onCreate"
                    :on-dismiss="props.paymentLinkCreation?.onDismiss"
                    :on-contact-support="props.onContactSupport"
                    :on-title-change="title => (modalTitleKey = title)"
                    embedded-in-overview
                />
                <PaymentLinkSettings
                    v-else
                    :store-ids="props.storeIds"
                    :on-dismiss="props.paymentLinkSettings?.onDismiss"
                    :on-contact-support="props.onContactSupport"
                    embedded-in-overview
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
