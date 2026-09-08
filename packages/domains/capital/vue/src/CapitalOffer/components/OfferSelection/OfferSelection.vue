<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    getEstimatedTerms,
    getOfferForTerm,
    getOffersByTerm,
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
    getDefaultAmountValue,
    getDefaultTerm,
    getAvailableTerms,
    adjustSelectedTerm,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { useOffers } from '../../composables/useOffers';
import { useCreateOffer } from '../../composables/useCreateOffer';
import type { IDynamicOffersConfig, IGrantOfferResponseDTO } from '@integration-components/types';
import { BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import AmountSelector from '../AmountSelector/AmountSelector.vue';
import CapitalError from '../../../shared/CapitalError/CapitalError.vue';
import OfferSelectionDetails from '../OfferSelectionDetails.vue';
import RenewalHighlights from '../RenewalHighlights.vue';
import TermSelector from '../TermSelector.vue';
import styles from './OfferSelection.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    dynamicOfferConfig: IDynamicOffersConfig;
    createdOffer: IGrantOfferResponseDTO | undefined;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onOfferCreate: (offer: IGrantOfferResponseDTO) => void;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const renewableGrant = computed(() => props.capitalState.renewableGrants?.[0]);
const isEarlyRenewal = computed(() => !!renewableGrant.value);
const estimatedTerms = computed(() => getEstimatedTerms(props.dynamicOfferConfig));
const hasSingleTerm = computed(() => estimatedTerms.value.length === 1);

const amountValue = ref<number>(props.createdOffer?.grantAmount.value ?? getDefaultAmountValue(props.dynamicOfferConfig));
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
    () => amountValue.value
);
const areAmountAndOffersUpdating = computed(() => isAmountChanging.value || areOffersLoading.value || isOffersRequestPending.value);
const hasNoOffers = computed(() => offers.value?.offers.length === 0);
const offersByTerm = computed(() => getOffersByTerm(offers.value?.offers ?? []));
const availableTerms = computed(() => getAvailableTerms(offersByTerm.value));
const term = ref<number | undefined>(props.createdOffer?.expectedRepaymentPeriodDays);
const selectedOffer = computed(() => (term.value === undefined ? undefined : getOfferForTerm(offersByTerm.value, term.value)));
const { error: createOfferError, isLoading: isCreateOfferLoading, createOffer } = useCreateOffer();
const isReviewDisabled = computed(() => !selectedOffer.value || areAmountAndOffersUpdating.value || isCreateOfferLoading.value);

// Initializes the selected term and adjusts it when it becomes unavailable
watch(
    [() => availableTerms.value, () => term.value],
    ([terms, selectedTerm]) => {
        if (!terms.length) return;

        let nextTerm: number | undefined;

        if (selectedTerm === undefined) {
            nextTerm = getDefaultTerm(terms);
        } else {
            nextTerm = terms.includes(selectedTerm) ? undefined : adjustSelectedTerm(terms, selectedTerm);
        }

        if (nextTerm !== undefined && nextTerm !== selectedTerm) {
            term.value = nextTerm;
        }
    },
    { immediate: true }
);

const handleAmountValueChange = (amount: number) => {
    cancelRequest();
    isAmountChanging.value = true;
    amountValue.value = amount;
};

const handleAmountValueChangeCommitted = (amount: number) => {
    requestOffers(amount);
    isAmountChanging.value = false;
};

const handleReview = async () => {
    if (!selectedOffer.value) return;

    try {
        const createdOffer = await createOffer(selectedOffer.value);
        if (createdOffer) {
            props.onOfferCreate(createdOffer);
        }
    } finally {
        userEvents.addEvent?.('Clicked button', {
            ...sharedCapitalOfferAnalyticsEventProperties,
            subCategory: 'Business financing offer',
            label: 'Review offer',
            isEarlyRenewal: isEarlyRenewal.value,
        });
    }
};

const actions = computed<BentoButtonActionsList>(() => {
    return [
        {
            title: i18n.get('capital.offer.selection.actions.reviewOffer'),
            disabled: isReviewDisabled.value,
            state: isCreateOfferLoading.value ? 'loading' : 'start',
            event: handleReview,
        },
        ...(props.onDismiss
            ? [
                  {
                      title: i18n.get('capital.common.actions.goBack'),
                      event: props.onDismiss,
                  },
              ]
            : []),
    ];
});
</script>

<template>
    <div :class="styles.root">
        <CapitalError
            v-if="offersError || hasNoOffers || createOfferError"
            :empty-grant-offer="hasNoOffers"
            :error="createOfferError ?? offersError"
            :on-back="props.onDismiss"
            :on-contact-support="props.onContactSupport"
        />
        <template v-else-if="amountValue">
            <AmountSelector
                :amount-value="amountValue"
                :dynamic-offer-config="dynamicOfferConfig"
                :is-early-renewal="isEarlyRenewal"
                :on-amount-value-change="handleAmountValueChange"
                :on-amount-value-change-committed="handleAmountValueChangeCommitted"
            />
            <RenewalHighlights
                v-if="renewableGrant"
                :new-grant-amount-value="amountValue"
                :remaining-grant-amount="renewableGrant.remainingGrantAmount"
            />
            <TermSelector
                v-if="estimatedTerms.length > 1"
                :are-available-terms-loading="areAmountAndOffersUpdating"
                :estimated-terms="estimatedTerms"
                :is-early-renewal="isEarlyRenewal"
                :offers-by-term="offersByTerm"
                :term="term"
                @term-change="value => (term = value)"
            />
            <OfferSelectionDetails
                v-if="selectedOffer && !areAmountAndOffersUpdating"
                :has-expected-repayment-period="hasSingleTerm"
                :offer="selectedOffer"
            />
            <BentoButtonActions :actions="actions" />
        </template>
    </div>
</template>
