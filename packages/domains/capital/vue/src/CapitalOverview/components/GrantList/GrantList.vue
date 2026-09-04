<script setup lang="ts">
import { ref } from 'vue';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import type { IGrant } from '@integration-components/types';
import GrantsDisplay from '../GrantsDisplay/GrantsDisplay.vue';
import CapitalOffer from '../../../CapitalOffer/components/CapitalOffer.vue';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    grants: IGrant[];
    hideTitle?: boolean;
    onFundsRequest?: OnFundsRequestCallback;
    onGrantListUpdateRequest: (data: IGrant) => void;
    onContactSupport?: () => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}>();

const isCapitalOfferVisible = ref(false);
const goBackToPreviousStep = () => {
    isCapitalOfferVisible.value = false;
};

const goToNextStep = () => {
    isCapitalOfferVisible.value = true;
};

const goBackToList = () => {
    if (props.onOfferDismiss) {
        props.onOfferDismiss(goBackToPreviousStep);
    } else {
        goBackToPreviousStep();
    }
};

const handleFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
    if (props.onFundsRequest) {
        props.onFundsRequest(data, renewsGrantId);
    } else {
        props.onGrantListUpdateRequest({ ...data, renewsGrantId });
        isCapitalOfferVisible.value = false;
    }
};
</script>

<template>
    <CapitalOffer
        v-if="isCapitalOfferVisible"
        :hide-title="props.hideTitle"
        :on-funds-request="handleFundsRequest"
        :external-capital-state="props.capitalState"
        :on-offer-dismiss="goBackToList"
        :on-contact-support="props.onContactSupport"
    />
    <GrantsDisplay v-else :grants="grants" :hide-title="props.hideTitle" :capital-state="props.capitalState" :on-new-offer-request="goToNextStep" />
</template>
