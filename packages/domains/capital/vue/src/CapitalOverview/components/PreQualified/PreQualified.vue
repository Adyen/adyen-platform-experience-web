<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import PreQualifiedIntro from '../PreQualifiedIntro/PreQualifiedIntro.vue';
import CapitalOffer from '../../../CapitalOffer/components/CapitalOffer.vue';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    hideTitle?: boolean;
    onFundsRequest: OnFundsRequestCallback;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}>();

type PreQualifiedState = 'noOffer' | 'intro' | 'offer';

const getStateFromProps = (): PreQualifiedState => (!props.capitalState.dynamicOffer ? 'noOffer' : props.skipPreQualifiedIntro ? 'offer' : 'intro');

const state = ref<PreQualifiedState>(getStateFromProps());

watch([() => props.capitalState.dynamicOffer, () => props.skipPreQualifiedIntro], () => {
    state.value = getStateFromProps();
});

const handleOfferOptionsRequest = () => {
    if (props.onOfferOptionsRequest) {
        props.onOfferOptionsRequest();
    } else {
        state.value = 'offer';
    }
};

const isOfferDismissButtonVisible = computed(() => !props.skipPreQualifiedIntro || !!props.onOfferDismiss);

const handleOfferDismiss = () => {
    if (props.onOfferDismiss) {
        props.onOfferDismiss();
    } else {
        state.value = 'intro';
    }
};
</script>

<template>
    <div v-if="state === 'noOffer' || state === 'offer'">
        <CapitalHeader v-if="state === 'noOffer'" :hide-title="props.hideTitle" title-key="capital.overview.common.titles.qualificationIntro" />
        <CapitalOffer
            :hide-title="state === 'noOffer' ? true : props.hideTitle"
            :on-funds-request="props.onFundsRequest"
            :external-capital-state="props.capitalState"
            :on-offer-dismiss="isOfferDismissButtonVisible && state === 'offer' ? handleOfferDismiss : undefined"
        />
    </div>
    <PreQualifiedIntro
        v-else-if="state === 'intro' && props.capitalState.dynamicOffer?.maxAmount"
        :hide-title="props.hideTitle"
        :max-amount="props.capitalState.dynamicOffer.maxAmount"
        :on-offer-options-request="handleOfferOptionsRequest"
        :region="props.capitalState.region"
    />
</template>
