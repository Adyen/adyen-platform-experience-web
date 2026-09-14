<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';
import { BentoModal } from '@adyen/bento-vue3';
import '@adyen/bento-vue3/styles/bento-light';
import { IGrant } from '@integration-components/types';
import { useEnhancedCapitalState } from '../../shared/composables/useEnhancedCapitalState';
import CapitalOffer from '../../CapitalOffer/components/CapitalOffer.vue';
const props = defineProps<{
    isOpen: boolean;
    onClose: () => void;
    onContactSupport?: () => void;
    onFundsRequest: OnFundsRequestCallback;
}>();

const { i18n } = useCoreContext();
const requestedGrant = ref<IGrant>();
const { capitalState } = useEnhancedCapitalState(() => true, requestedGrant);
const offerTitleKey = ref<TranslationKey>('capital.offer.selection.title');
const offerTitle = computed(() => i18n.get(offerTitleKey.value));

const handleOfferTitleChange = (title: TranslationKey) => {
    offerTitleKey.value = title;
};
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" @close-modal="props.onClose">
        {{ offerTitle }}
        <template #content>
            <CapitalOffer
                :capital-state="capitalState"
                hide-subtitle
                hide-title
                :on-contact-support="props.onContactSupport"
                :on-funds-request="props.onFundsRequest"
                :on-title-change="handleOfferTitleChange"
            />
        </template>
    </BentoModal>
</template>
