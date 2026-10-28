<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';

const props = defineProps<{
    id: string;
    onContactSupport?: () => void;
    onClose: () => void;
    onUpdate: () => void;
}>();

const { i18n } = useCoreContext();
const modalTitleKey = ref<PayByLinkTranslationKey | undefined>('payByLink.details.title');
const modalTitle = computed(() => (modalTitleKey.value ? i18n.get(modalTitleKey.value) : undefined));
const PaymentLinkDetails = defineAsyncComponent({
    loader: () => import('../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});

function handleTitleChange(title: PayByLinkTranslationKey | undefined) {
    modalTitleKey.value = title;
}
</script>

<template>
    <BentoModal
        :is-open="true"
        size="large"
        :is-dismissible="true"
        :aria-label="modalTitle ?? i18n.get('payByLink.details.title')"
        @close-modal="props.onClose"
    >
        <template #default>{{ modalTitle }}</template>
        <template #content>
            <ModalContextProvider>
                <PaymentLinkDetails
                    :id="props.id"
                    :on-contact-support="props.onContactSupport"
                    :on-update="props.onUpdate"
                    :on-title-change="handleTitleChange"
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
