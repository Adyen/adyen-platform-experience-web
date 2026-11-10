<script setup lang="ts">
import { ref } from 'vue';
import { OnSubmitCallback } from '@integration-components/capital/domain';
import { ModalContextProvider } from '@integration-components/core/vue';
import { BentoModal } from '@adyen/bento-vue3';
import { IGrant } from '@integration-components/types';
import { useEnhancedCapitalState } from '../../shared/composables/useEnhancedCapitalState';
import CapitalOffer from '../../CapitalOffer/components/CapitalOffer/CapitalOffer.vue';
const props = defineProps<{
    isOpen: boolean;
    onClose: () => void;
    onContactSupport?: () => void;
    onSubmit: OnSubmitCallback;
}>();

const requestedGrant = ref<IGrant>();
const { capitalState } = useEnhancedCapitalState(() => true, requestedGrant);
const offerTitle = ref<string>();

const handleOfferTitleChange = (title: string) => {
    offerTitle.value = title;
};
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" @close-modal="props.onClose">
        {{ offerTitle }}
        <template #content>
            <ModalContextProvider>
                <CapitalOffer
                    :capital-state="capitalState"
                    hide-subtitle
                    :on-contact-support="props.onContactSupport"
                    :on-submit="props.onSubmit"
                    :on-title-change="handleOfferTitleChange"
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
