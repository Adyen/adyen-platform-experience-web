<script setup lang="ts">
import { computed, ref } from 'vue';
import '@adyen/bento-vue3/styles/bento-light';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { getDynamicOfferConfig, getIsEarlyRenewal, sharedCapitalOfferAnalyticsEventProperties } from '@integration-components/capital/domain';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import OfferSelection from './OfferSelection/OfferSelection.vue';
import OfferSummary from './OfferSummary/OfferSummary.vue';
import type { CapitalOfferComponentProps } from '../types';
import { useEnhancedCapitalState } from '../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../shared/CapitalHeader/CapitalHeader.vue';
import CapitalError from '../../shared/CapitalError/CapitalError.vue';

const props = defineProps<CapitalOfferComponentProps>();

const externalCapitalState = computed(() => props.externalCapitalState);
const { capitalState: backendCapitalState, error: capitalStateError } = useEnhancedCapitalState(() => !externalCapitalState.value);
const capitalState = computed(() => externalCapitalState.value ?? backendCapitalState.value);
const dynamicOfferConfig = computed(() => capitalState.value && getDynamicOfferConfig(capitalState.value));
const createdOffer = ref<IGrantOfferResponseDTO>();
const isOfferReviewVisible = ref(false);

useLandedPageEvent(
    () => ({
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Capital offer',
        label: 'Capital offer',
        isEarlyRenewal: capitalState.value ? getIsEarlyRenewal(capitalState.value) : false,
    }),
    () => !!capitalState.value
);

const handleOfferSelect = (offer: IGrantOfferResponseDTO) => {
    if (props.onOfferSelect) {
        props.onOfferSelect(offer);
        return;
    }

    createdOffer.value = offer;
    isOfferReviewVisible.value = true;
};

const handleSummaryBack = () => {
    isOfferReviewVisible.value = false;
};
</script>

<template>
    <CapitalHeader
        :hide-title="props.hideTitle"
        :region="capitalState?.region"
        :title-key="isOfferReviewVisible ? 'capital.offer.summary.title' : 'capital.offer.selection.title'"
    />
    <CapitalError v-if="capitalStateError" :error="capitalStateError" :on-back="props.onOfferDismiss" :on-contact-support="props.onContactSupport" />
    <template v-else-if="capitalState">
        <CapitalError
            v-if="!capitalState.isRegionSupported || !dynamicOfferConfig"
            :empty-grant-offer="!dynamicOfferConfig"
            :unsupported-region="!capitalState.isRegionSupported"
        />
        <template v-else>
            <OfferSelection
                v-show="!isOfferReviewVisible"
                :capital-state="capitalState"
                :created-offer="createdOffer"
                :dynamic-offer-config="dynamicOfferConfig"
                :on-contact-support="props.onContactSupport"
                :on-dismiss="props.onOfferDismiss"
                :on-offer-create="handleOfferSelect"
            />
            <OfferSummary
                v-if="createdOffer"
                v-show="isOfferReviewVisible"
                :capital-state="capitalState"
                :offer="createdOffer"
                :on-back="handleSummaryBack"
                :on-contact-support="props.onContactSupport"
                :on-funds-request="props.onFundsRequest"
            />
        </template>
    </template>
</template>
