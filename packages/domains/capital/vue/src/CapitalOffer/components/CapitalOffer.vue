<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { getDynamicOfferConfig, getIsEarlyRenewal, sharedCapitalOfferAnalyticsEventProperties } from '@integration-components/capital/domain';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import OfferSelection from './OfferSelection/OfferSelection.vue';
import OfferSummary from './OfferSummary.vue';
import type { CapitalOfferComponentProps } from '../types';
import { useCapitalState } from '../composables/useCapitalState';
import CapitalHeader from '../../shared/CapitalHeader/CapitalHeader.vue';
import CapitalErrorMessageDisplay from '../../shared/CapitalErrorMessageDisplay.vue';

const props = defineProps<CapitalOfferComponentProps>();

const selectedAmount = ref<number>();
const selectedTerm = ref<number>();
const selectedOffer = ref<IGrantOfferResponseDTO>();
const externalCapitalState = computed(() => props.externalCapitalState);
const { capitalState: backendCapitalState, error: capitalStateError } = useCapitalState(() => !externalCapitalState.value);
const capitalState = computed(() => externalCapitalState.value ?? backendCapitalState.value);
const dynamicOfferConfig = computed(() => capitalState.value && getDynamicOfferConfig(capitalState.value));

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

    selectedOffer.value = offer;
};

const handleSummaryBack = () => {
    selectedOffer.value = undefined;
};
</script>

<template>
    <CapitalHeader
        :hide-title="props.hideTitle"
        :region="capitalState?.region"
        :title-key="selectedOffer ? 'capital.offer.summary.title' : 'capital.offer.selection.title'"
    />
    <CapitalErrorMessageDisplay
        v-if="capitalStateError"
        :error="capitalStateError"
        :on-back="props.onOfferDismiss"
        :on-contact-support="props.onContactSupport"
    />
    <template v-else-if="capitalState">
        <CapitalErrorMessageDisplay
            v-if="!capitalState.isRegionSupported || !dynamicOfferConfig"
            :empty-grant-offer="!dynamicOfferConfig"
            :unsupported-region="!capitalState.isRegionSupported"
        />
        <OfferSelection
            v-else-if="!selectedOffer"
            :capital-state="capitalState"
            :dynamic-offer-config="dynamicOfferConfig"
            :selected-amount="selectedAmount"
            :selected-term="selectedTerm"
            :on-selected-amount-change="value => (selectedAmount = value)"
            :on-selected-term-change="term => (selectedTerm = term)"
            :on-offer-select="handleOfferSelect"
            :on-contact-support="props.onContactSupport"
            :on-offer-dismiss="props.onOfferDismiss"
        />
        <OfferSummary
            v-else
            :capital-state="capitalState"
            :grant-offer="selectedOffer"
            :on-back="handleSummaryBack"
            :on-funds-request="props.onFundsRequest"
            :on-contact-support="props.onContactSupport"
        />
    </template>
</template>
