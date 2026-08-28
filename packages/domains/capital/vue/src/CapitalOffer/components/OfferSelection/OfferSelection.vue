<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    adjustSelectedTerm,
    getAvailableTerms,
    getDefaultAmountValue,
    getDefaultTerm,
    getEstimatedTerms,
    getIsEarlyRenewal,
    getOfferForTerm,
    getOffersByTerm,
    getPercentageOfRange,
    getRelativeToDefault,
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { useOffers } from '../../composables/useOffers';
import type { IDynamicOffersConfig, IGrantOfferResponseDTO } from '@integration-components/types';
import { BentoCard } from '@adyen/bento-vue3';
import AmountSlider from '../AmountSlider/AmountSlider.vue';
import CapitalErrorMessageDisplay from '../../../shared/CapitalErrorMessageDisplay.vue';
import OfferDetails from '../OfferDetails.vue';
import RenewalHighlightedFields from '../RenewalHighlightedFields/RenewalHighlightedFields.vue';
import TermSelector from '../TermSelector.vue';
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

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const renewableGrant = computed(() => props.capitalState.renewableGrants?.[0]);
const hasEmittedInitialSliderEvent = ref(false);
const isAmountChanging = ref(false);
const {
    cancelRequest,
    data: offers,
    error: offersError,
    isLoading: areOffersLoading,
    isRequestPending: isOffersRequestPending,
    requestOffers,
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

const allTerms = computed(() => getEstimatedTerms(props.dynamicOfferConfig));
const hasSingleTerm = computed(() => allTerms.value.length === 1);
const hasNoOffers = computed(() => offers.value?.offers.length === 0);
const offersByTerm = computed(() => getOffersByTerm(offers.value?.offers ?? []));
const availableTerms = computed(() => getAvailableTerms(offersByTerm.value));
const selectedOffer = computed(() => (props.selectedTerm === undefined ? undefined : getOfferForTerm(offersByTerm.value, props.selectedTerm)));
const areOffersUpdating = computed(() => isAmountChanging.value || areOffersLoading.value || isOffersRequestPending.value);

watch(
    [availableTerms, () => props.selectedTerm],
    ([terms, selectedTerm]) => {
        if (!terms.length) return;

        const nextTerm =
            selectedTerm === undefined ? getDefaultTerm(terms) : terms.includes(selectedTerm) ? undefined : adjustSelectedTerm(terms, selectedTerm);

        if (nextTerm !== undefined && nextTerm !== selectedTerm) {
            props.onSelectedTermChange(nextTerm);
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
    isAmountChanging.value = true;
    props.onSelectedAmountChange(amount);
};

const handleSliderRelease = (amount: number) => {
    requestOffers(amount);
    isAmountChanging.value = false;
    emitAmountValueChangeEvent(amount);
};

const handleTermSelect = (term: number) => {
    const selectedRate = offersByTerm.value[term]?.repaymentRate;

    props.onSelectedTermChange(term);
    userEvents.addEvent?.('Selected repayment term', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing offer',
        allTerms: allTerms.value,
        availableTerms: availableTerms.value,
        selectedTerm: term,
        relativeToDefault: getRelativeToDefault(term, 180),
        availableRates: availableTerms.value.map(availableTerm => offersByTerm.value[availableTerm]?.repaymentRate),
        selectedRate,
        isEarlyRenewal: getIsEarlyRenewal(props.capitalState),
    });
};
</script>

<template>
    <div :class="styles.root">
        <CapitalErrorMessageDisplay
            v-if="offersError || hasNoOffers"
            :empty-grant-offer="hasNoOffers"
            :error="offersError"
            :on-back="props.onOfferDismiss"
            :on-contact-support="props.onContactSupport"
        />
        <template v-else-if="props.selectedAmount">
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
            <TermSelector
                v-if="allTerms.length > 1 && props.selectedTerm"
                :estimated-terms="allTerms"
                :available-terms="availableTerms"
                :are-available-terms-loading="areOffersUpdating"
                :offers-by-term="offersByTerm"
                :selected-term="props.selectedTerm"
                @select="handleTermSelect"
            />
            <BentoCard v-if="selectedOffer && !areOffersUpdating" background="secondary">
                {{ i18n.get('capital.common.termsTitle') }}
                <template #content>
                    <OfferDetails :offer="selectedOffer" :has-single-term="hasSingleTerm" />
                </template>
            </BentoCard>
        </template>
    </div>
</template>
