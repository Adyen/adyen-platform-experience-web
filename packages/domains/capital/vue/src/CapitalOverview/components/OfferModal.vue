<script setup lang="ts">
import { computed, ref } from 'vue';
import { type CapitalTranslationKey, OnFundsRequestCallback } from '@integration-components/capital/domain';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import { BentoModal } from '@adyen/bento-vue3';
import { IGrant } from '@integration-components/types';
import { useEnhancedCapitalState } from '../../shared/composables/useEnhancedCapitalState';
import CapitalOffer from '../../CapitalOffer/components/CapitalOffer/CapitalOffer.vue';
const props = defineProps<{
    isOpen: boolean;
    onClose: () => void;
    onContactSupport?: () => void;
    onFundsRequest: OnFundsRequestCallback;
}>();

const { i18n } = useCoreContext();
const requestedGrant = ref<IGrant>();
const { capitalState } = useEnhancedCapitalState(() => true, requestedGrant);
const offerTitleKey = ref<CapitalTranslationKey>('capital.offer.selection.title');
const offerTitle = computed(() => i18n.get(offerTitleKey.value));

const handleOfferTitleChange = (title: CapitalTranslationKey) => {
    offerTitleKey.value = title;
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
                    :on-funds-request="props.onFundsRequest"
                    :on-title-change="handleOfferTitleChange"
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
