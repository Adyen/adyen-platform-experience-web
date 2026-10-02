<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { getDynamicOfferConfig, sharedCapitalOfferAnalyticsEventProperties } from '@integration-components/capital/domain';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import OfferSelection from './OfferSelection/OfferSelection.vue';
import OfferSummary from './OfferSummary/OfferSummary.vue';
import type { CapitalOfferProps } from '../types';
import { useEnhancedCapitalState } from '../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../shared/CapitalHeader/CapitalHeader.vue';
import CapitalError from '../../shared/CapitalError/CapitalError.vue';

const props = defineProps<CapitalOfferProps>();

const { capitalState: backendCapitalState, error: capitalStateError } = useEnhancedCapitalState(() => !props.capitalState);
const capitalState = computed(() => props.capitalState ?? backendCapitalState.value);
const dynamicOfferConfig = computed(() => capitalState.value && getDynamicOfferConfig(capitalState.value));
const activeStep = ref<'selection' | 'summary'>('selection');
const titleKey = computed(() => (activeStep.value === 'summary' ? 'capital.offer.summary.title' : 'capital.offer.selection.title'));
const createdOffer = ref<IGrantOfferResponseDTO>();

useLandedPageEvent(
    () => ({
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Capital offer',
        label: 'Capital offer',
        isEarlyRenewal: !!capitalState.value?.renewableGrants.length,
    }),
    () => !!capitalState.value
);

watch(titleKey, title => props.onTitleChange?.(title), { immediate: true });

const handleOfferSelect = (offer: IGrantOfferResponseDTO) => {
    createdOffer.value = offer;
    activeStep.value = 'summary';
};

const handleSummaryBack = () => {
    activeStep.value = 'selection';
};
</script>

<template>
    <CapitalHeader :hide-subtitle="props.hideSubtitle" :hide-title="props.hideTitle" :region="capitalState?.region" :title-key="titleKey" />
    <CapitalError v-if="capitalStateError" :error="capitalStateError" :on-back="props.onOfferDismiss" :on-contact-support="props.onContactSupport" />
    <template v-else-if="capitalState">
        <CapitalError
            v-if="!capitalState.isRegionSupported || !dynamicOfferConfig"
            :empty-grant-offer="!dynamicOfferConfig"
            :unsupported-region="!capitalState.isRegionSupported"
        />
        <template v-else>
            <OfferSelection
                v-show="activeStep === 'selection'"
                :capital-state="capitalState"
                :created-offer="createdOffer"
                :dynamic-offer-config="dynamicOfferConfig"
                :on-contact-support="props.onContactSupport"
                :on-dismiss="props.onOfferDismiss"
                :on-offer-create="handleOfferSelect"
            />
            <OfferSummary
                v-if="createdOffer"
                v-show="activeStep === 'summary'"
                :capital-state="capitalState"
                :offer="createdOffer"
                :on-back="handleSummaryBack"
                :on-contact-support="props.onContactSupport"
                :on-funds-request="props.onFundsRequest"
            />
        </template>
    </template>
</template>
