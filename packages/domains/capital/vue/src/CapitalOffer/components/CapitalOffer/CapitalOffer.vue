<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { getDynamicOfferConfig, sharedCapitalOfferAnalyticsEventProperties } from '@integration-components/capital/domain';
import { ComponentShell, ComponentShellState, useLandedPageEvent } from '@integration-components/composables-vue';
import OfferSelection from '../OfferSelection/OfferSelection.vue';
import OfferSummary from '../OfferSummary/OfferSummary.vue';
import type { CapitalOfferComponentProps } from '../../types';
import { useEnhancedCapitalState } from '../../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import CapitalError from '../../../shared/CapitalError.vue';
import EmptyOfferState from '../../../shared/EmptyOfferState.vue';
import UnsupportedRegionState from '../../../shared/UnsupportedRegionState.vue';
import styles from './CapitalOffer.module.scss';
import OfferSelectionLoadingSkeleton from '../OfferSelectionLoadingSkeleton/OfferSelectionLoadingSkeleton.vue';

const props = defineProps<CapitalOfferComponentProps>();

const {
    capitalState: backendCapitalState,
    error: capitalStateError,
    isLoading: isCapitalStateLoading,
} = useEnhancedCapitalState(() => !props.capitalState);
const capitalState = computed(() => props.capitalState ?? backendCapitalState.value);
const dynamicOfferConfig = computed(() => capitalState.value && getDynamicOfferConfig(capitalState.value));
const activeStep = ref<'selection' | 'summary'>('selection');
const titleKey = computed(() => (activeStep.value === 'summary' ? 'capital.offer.summary.title' : 'capital.offer.selection.title'));
const createdOffer = ref<IGrantOfferResponseDTO>();
const shellState = computed<ComponentShellState>(() => (isCapitalStateLoading.value ? 'loading' : 'ready'));

useLandedPageEvent(
    () => ({
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer selection',
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
    <div :class="styles.root">
        <ComponentShell :state="shellState">
            <template #loading>
                <OfferSelectionLoadingSkeleton />
            </template>
            <CapitalError
                v-if="capitalStateError"
                :error="capitalStateError"
                :on-dismiss="props.onDismiss"
                :on-contact-support="props.onContactSupport"
            />
            <template v-else-if="capitalState">
                <CapitalHeader :hide-subtitle="props.hideSubtitle" :region="capitalState.region" :title-key="titleKey" />
                <UnsupportedRegionState v-if="!capitalState.isRegionSupported" :on-dismiss="props.onDismiss" />
                <EmptyOfferState v-else-if="!dynamicOfferConfig" :on-dismiss="props.onDismiss" />
                <template v-else>
                    <OfferSelection
                        v-show="activeStep === 'selection'"
                        :capital-state="capitalState"
                        :created-offer="createdOffer"
                        :dynamic-offer-config="dynamicOfferConfig"
                        :on-contact-support="props.onContactSupport"
                        :on-dismiss="props.onDismiss"
                        :on-offer-create="handleOfferSelect"
                    />
                    <OfferSummary
                        v-if="createdOffer"
                        v-show="activeStep === 'summary'"
                        :capital-state="capitalState"
                        :offer="createdOffer"
                        :on-back="handleSummaryBack"
                        :on-contact-support="props.onContactSupport"
                        :on-dismiss="props.onDismiss"
                        :on-funds-request="props.onFundsRequest"
                    />
                </template>
            </template>
        </ComponentShell>
    </div>
</template>
