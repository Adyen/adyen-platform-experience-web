<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    getDefaultAmountValue,
    getIsEarlyRenewal,
    getPercentageOfRange,
    getRelativeToDefault,
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
} from '@integration-components/capital/domain';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import { useOffers } from '../../composables/useOffers';
import type { IDynamicOffersConfig, IGrantOfferResponseDTO } from '@integration-components/types';
import AmountSlider from '../AmountSlider/AmountSlider.vue';
import RenewalHighlightedFields from '../RenewalHighlightedFields/RenewalHighlightedFields.vue';
import CapitalErrorMessageDisplay from '../../../shared/CapitalErrorMessageDisplay.vue';
import styles from './OfferSelection.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    dynamicOfferConfig: IDynamicOffersConfig;
    selectedAmount: number | undefined;
    selectedTerm: number | undefined;
    onContactSupport?: () => void;
    onOfferDismiss?: () => void;
    onOfferSelect: (offer: IGrantOfferResponseDTO) => void;
    onSelectedAmountChange: (amount: number) => void;
    onSelectedTermChange: (term: number) => void;
}>();

const renewableGrant = computed(() => props.capitalState.renewableGrants?.[0]);
const userEvents = useEventDispatcherContext();
const hasEmittedInitialSliderEvent = ref(false);
const {
    cancelRequest,
    error: offersError,
    requestOffer,
} = useOffers(
    () => props.dynamicOfferConfig,
    () => props.selectedAmount
);

// Initialize selectedAmount with default value
watch(
    () => props.dynamicOfferConfig,
    config => {
        if (props.selectedAmount === undefined) {
            props.onSelectedAmountChange(getDefaultAmountValue(config));
        }
    },
    { immediate: true }
);

const emitAmountValueChangeEvent = (amountValue: number) => {
    const config = props.dynamicOfferConfig;

    userEvents.addEvent?.('Changed capital offer slider', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing offer',
        label: 'Slider changed',
        currency: config.minAmount.currency,
        value: amountValue,
        valuePercentage: getPercentageOfRange(amountValue, config.minAmount.value, config.maxAmount.value),
        min: config.minAmount.value,
        max: config.maxAmount.value,
        relativeToDefault: getRelativeToDefault(amountValue, getDefaultAmountValue(config)),
        isEarlyRenewal: getIsEarlyRenewal(props.capitalState),
    });
};

// Emit initial slider-changed event only once
watch(
    [() => props.dynamicOfferConfig, () => props.selectedAmount],
    ([config, amount]) => {
        if (!hasEmittedInitialSliderEvent.value && config && amount !== undefined) {
            hasEmittedInitialSliderEvent.value = true;
            emitAmountValueChangeEvent(amount);
        }
    },
    { immediate: true }
);

const handleAmountValueChange = (amount: number) => {
    cancelRequest();
    props.onSelectedAmountChange(amount);
};

const handleSliderRelease = (amount: number) => {
    requestOffer(amount);
    emitAmountValueChangeEvent(amount);
};
</script>

<template>
    <div v-if="props.selectedAmount" :class="styles.root">
        <CapitalErrorMessageDisplay
            v-if="offersError"
            :error="offersError"
            :on-back="props.onOfferDismiss"
            :on-contact-support="props.onContactSupport"
        />
        <template v-else>
            <AmountSlider
                :dynamic-offer-config="dynamicOfferConfig"
                :value="props.selectedAmount"
                :on-release="handleSliderRelease"
                :on-value-change="handleAmountValueChange"
            />
            <RenewalHighlightedFields
                v-if="renewableGrant"
                :new-grant-amount-value="props.selectedAmount"
                :remaining-grant-amount="renewableGrant.remainingGrantAmount"
            />
        </template>
    </div>
</template>
