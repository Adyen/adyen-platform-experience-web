<script setup lang="ts">
import { ref } from 'vue';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import PreQualifiedIntro from '../PreQualifiedIntro/PreQualifiedIntro.vue';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    hideTitle?: boolean;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}>();

type PreQualifiedState = 'noOffer' | 'intro' | 'offer';

const state = ref<PreQualifiedState>(!props.capitalState.dynamicOffer ? 'noOffer' : props.skipPreQualifiedIntro ? 'offer' : 'intro');

const handleOfferOptionsRequest = () => {
    if (props.onOfferOptionsRequest) {
        props.onOfferOptionsRequest();
    } else {
        state.value = 'offer';
    }
};

// TODO: Enable these handlers when the Vue offer component is implemented.
//
// const isOfferDismissButtonVisible = computed(() => !props.skipPreQualifiedIntro || !!props.onOfferDismiss);
//
// const handleOfferDismiss = () => {
//     if (props.onOfferDismiss) {
//         props.onOfferDismiss();
//     } else {
//         state.value = 'intro';
//     }
// };
</script>

<template>
    <div v-if="state === 'noOffer'">
        <CapitalHeader :hide-title="props.hideTitle" title-key="capital.overview.common.titles.qualificationIntro" />
        <!-- TODO: Render CapitalOffer when the Vue component is available. -->
    </div>
    <PreQualifiedIntro
        v-else-if="state === 'intro' && props.capitalState.dynamicOffer?.maxAmount"
        :hide-title="props.hideTitle"
        :max-amount="props.capitalState.dynamicOffer.maxAmount"
        :on-offer-options-request="handleOfferOptionsRequest"
        :region="props.capitalState.region"
    />
    <div v-else-if="state === 'offer'">
        <!-- TODO: Render CapitalOffer when the Vue component is available. -->
    </div>
</template>
