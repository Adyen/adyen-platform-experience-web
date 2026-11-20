<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { IOffer } from '@integration-components/types';
import { getDynamicOfferConfig, sharedCapitalOfferAnalyticsEventProperties } from '@integration-components/capital/domain';
import { ComponentShell, ComponentShellState, useLandedPageEvent } from '@integration-components/composables-vue';
import { useCoreContext } from '@integration-components/core/vue';
import OfferSelection from '../OfferSelection/OfferSelection.vue';
import OfferSummary from '../OfferSummary/OfferSummary.vue';
import type { CapitalOfferComponentProps } from '../../types';
import { useEnhancedCapitalState } from '../../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import CapitalError from '../../../shared/CapitalError.vue';
import EmptyOfferState from '../../../shared/EmptyOfferState.vue';
import UnsupportedRegionState from '../../../shared/UnsupportedRegionState.vue';
import { CONTRACT_KEYS } from './contractKeys';
import styles from './CapitalOffer.module.scss';
import OfferSelectionLoadingSkeleton from '../OfferSelectionLoadingSkeleton/OfferSelectionLoadingSkeleton.vue';

const props = defineProps<CapitalOfferComponentProps>();
const { i18n } = useCoreContext();

const {
    capitalState: backendCapitalState,
    error: capitalStateError,
    isLoading: isCapitalStateLoading,
} = useEnhancedCapitalState(() => !props.capitalState);
const capitalState = computed(() => props.capitalState ?? backendCapitalState.value);
const dynamicOfferConfig = computed(() => capitalState.value && getDynamicOfferConfig(capitalState.value));
const activeStep = ref<'selection' | 'summary'>('selection');

const title = computed(() => {
    const contractType = dynamicOfferConfig.value?.contractType;
    if (!contractType) return i18n.get('capital.offer.selection.title');

    const titleKeys = activeStep.value === 'summary' ? CONTRACT_KEYS.summaryTitle : CONTRACT_KEYS.selectionTitle;
    return i18n.get(titleKeys[contractType]);
});

const subtitle = computed(() => {
    const region = capitalState.value?.region;
    if (props.hideSubtitle || !region) return undefined;

    const contractType = dynamicOfferConfig.value?.contractType;
    const key = contractType && region === 'GB' ? CONTRACT_KEYS.providerInfoGB[contractType] : `capital.common.providerInfo.${region}`;
    return i18n.has(key) ? i18n.get(key) : undefined;
});

const createdOffer = ref<IOffer>();
const shellState = computed<ComponentShellState>(() => (isCapitalStateLoading.value ? 'loading' : 'ready'));

useLandedPageEvent(
    () => ({
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer selection',
        isEarlyRenewal: !!capitalState.value?.renewableGrants.length,
    }),
    () => !!capitalState.value
);

watch(title, value => props.onTitleChange?.(value), { immediate: true });

const handleOfferSelect = (offer: IOffer) => {
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
            <CapitalHeader :subtitle="subtitle" :title="title" />
            <CapitalError v-if="capitalStateError" :error="capitalStateError" :on-contact-support="props.onContactSupport" />
            <template v-else-if="capitalState">
                <UnsupportedRegionState v-if="!capitalState.isRegionSupported" />
                <EmptyOfferState v-else-if="!dynamicOfferConfig" />
                <template v-else>
                    <OfferSelection
                        v-show="activeStep === 'selection'"
                        :capital-state="capitalState"
                        :created-offer="createdOffer"
                        :dynamic-offer-config="dynamicOfferConfig"
                        :on-contact-support="props.onContactSupport"
                        :on-offer-create="handleOfferSelect"
                    />
                    <OfferSummary
                        v-if="createdOffer"
                        v-show="activeStep === 'summary'"
                        :capital-state="capitalState"
                        :contract-type="dynamicOfferConfig.contractType"
                        :offer="createdOffer"
                        :on-back="handleSummaryBack"
                        :on-contact-support="props.onContactSupport"
                        :on-submit="props.onSubmit"
                    />
                </template>
            </template>
        </ComponentShell>
    </div>
</template>
