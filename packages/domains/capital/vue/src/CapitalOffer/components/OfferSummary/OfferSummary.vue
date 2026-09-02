<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import {
    getBalanceAccountErrorMessage,
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
    type OnFundsRequestCallback,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useRequestFunds } from '../../composables/useRequestFunds';
import CapitalErrorMessageDisplay from '../../../shared/CapitalErrorMessageDisplay.vue';
import Highlights from '../Highlights/Highlights.vue';
import LegalNotice from '../LegalNotice/LegalNotice.vue';
import RenewalHighlights from '../RenewalHighlights.vue';
import OfferSummaryDetails from '../OfferSummaryDetails/OfferSummaryDetails.vue';
import styles from './OfferSummary.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    offer: IGrantOfferResponseDTO;
    onBack: () => void;
    onContactSupport?: () => void;
    onFundsRequest: OnFundsRequestCallback;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const renewableGrant = computed(() => props.capitalState.renewableGrants[0]);
const isEarlyRenewal = computed(() => !!renewableGrant.value);
const offerAmount = i18n.amount(props.offer.grantAmount.value, props.offer.grantAmount.currency, { minimumFractionDigits: 0 });
const highlights = computed(() => [
    {
        label: i18n.get('capital.common.fields.financing'),
        value: offerAmount,
    },
    {
        label: i18n.get('capital.common.fields.fees'),
        value: i18n.amount(props.offer.feesAmount.value, props.offer.feesAmount.currency, { minimumFractionDigits: 0 }),
    },
    {
        label: i18n.get('capital.common.fields.totalRepaymentAmount'),
        value: i18n.amount(props.offer.totalAmount.value, props.offer.totalAmount.currency, { minimumFractionDigits: 0 }),
    },
]);
const { data: requestedFunds, error: requestFundsError, isLoading: isRequestFundsLoading, requestFunds } = useRequestFunds();
const balanceAccountError = computed(() => getBalanceAccountErrorMessage(requestFundsError.value));

async function handleRequestFunds() {
    const grant = await requestFunds(props.offer.id, renewableGrant.value?.id);
    if (grant) {
        props.onFundsRequest(grant, renewableGrant.value?.id);
    }

    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing summary',
        label: 'Request funds',
        isEarlyRenewal: isEarlyRenewal.value,
    });
}

function handleBack() {
    props.onBack();
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing summary',
        label: 'Back to slider view',
        isEarlyRenewal: isEarlyRenewal.value,
    });
}

const actions = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('capital.offer.summary.actions.requestFundsWithAmount', { values: { amount: offerAmount } }),
        state: isRequestFundsLoading.value ? 'loading' : undefined,
        disabled: isRequestFundsLoading.value || !!requestFundsError.value || !!requestedFunds.value,
        event: handleRequestFunds,
    },
    {
        title: i18n.get('capital.common.actions.goBack'),
        event: handleBack,
    },
]);
</script>

<template>
    <div :class="styles.root">
        <CapitalErrorMessageDisplay
            v-if="requestFundsError && !balanceAccountError"
            :error="requestFundsError"
            :on-back="handleBack"
            :on-contact-support="props.onContactSupport"
        />
        <template v-else>
            <div :class="styles.highlights">
                <RenewalHighlights
                    v-if="renewableGrant"
                    :new-grant-amount-value="props.offer.grantAmount.value"
                    :remaining-grant-amount="renewableGrant.remainingGrantAmount"
                />
                <Highlights :items="highlights" />
            </div>
            <OfferSummaryDetails :capital-state="props.capitalState" :grant-offer="props.offer" :has-balance-account-error="!!balanceAccountError" />
            <BentoAlert v-if="balanceAccountError" type="warning" role="alert">
                <template #default>
                    {{ i18n.get(balanceAccountError.title) }}
                </template>
                <template #description>
                    {{ i18n.get(balanceAccountError.message) }}
                </template>
                <template v-if="props.onContactSupport" #actions>
                    <BentoButton variant="tertiary" @click="props.onContactSupport">
                        {{ i18n.get('capital.common.actions.contactSupport') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <BentoAlert v-if="isEarlyRenewal">
                <template #default>
                    {{ i18n.get('capital.offer.summary.earlyRenewalNotice.title') }}
                </template>
                <template #description>
                    {{ i18n.get('capital.offer.summary.earlyRenewalNotice.description') }}
                </template>
            </BentoAlert>
            <LegalNotice :region="props.capitalState.region" />
            <BentoButtonActions :actions="actions" />
        </template>
    </div>
</template>
