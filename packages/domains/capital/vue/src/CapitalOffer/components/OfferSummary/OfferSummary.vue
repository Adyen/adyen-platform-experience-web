<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, type BentoButtonActionsList, BentoTypography } from '@adyen/bento-vue3';
import {
    getBalanceAccountErrorMessage,
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
    type OnSubmitCallback,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useRequestFunds } from '../../composables/useRequestFunds';
import { useCapitalCopy } from '../../../shared/composables/useCapitalCopy';
import CapitalError from '../../../shared/CapitalError.vue';
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
    onSubmit?: OnSubmitCallback;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const userEvents = useEventDispatcherContext();
const renewableGrant = computed(() => props.capitalState.renewableGrants[0]);
const isEarlyRenewal = computed(() => !!renewableGrant.value);
const offerAmount = computed(() => i18n.amount(props.offer.grantAmount.value, props.offer.grantAmount.currency, { minimumFractionDigits: 0 }));
const highlights = computed(() => [
    {
        label: getContractCopy('capital.common.fields.financing', props.offer.contractType),
        value: offerAmount.value,
    },
    {
        align: 'center' as const,
        value: '+',
    },
    {
        label: i18n.get('capital.common.fields.fees'),
        value: i18n.amount(props.offer.feesAmount.value, props.offer.feesAmount.currency, { minimumFractionDigits: 0 }),
    },
    {
        align: 'center' as const,
        value: '=',
    },
    {
        label: getContractCopy('capital.common.fields.totalRepaymentAmount', props.offer.contractType),
        value: i18n.amount(props.offer.totalAmount.value, props.offer.totalAmount.currency, { minimumFractionDigits: 0 }),
    },
]);
const {
    data: requestedFunds,
    error: requestFundsError,
    isLoading: isRequestFundsLoading,
    requestFunds,
    reset: resetRequestedFunds,
} = useRequestFunds();
const balanceAccountError = computed(() => getBalanceAccountErrorMessage(requestFundsError.value));

async function handleRequestFunds() {
    const grant = await requestFunds(props.offer.id, renewableGrant.value?.id);
    if (grant) {
        props.onSubmit?.(grant, renewableGrant.value?.id);
    }

    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer summary',
        label: 'Submit request',
        isEarlyRenewal: isEarlyRenewal.value,
    });
}

function handleBack() {
    props.onBack();
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer summary',
        label: 'Go back',
        isEarlyRenewal: isEarlyRenewal.value,
    });
}

const actions = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('capital.offer.summary.actions.submit', { values: { amount: offerAmount.value } }),
        state: isRequestFundsLoading.value ? 'loading' : undefined,
        disabled: !!requestFundsError.value || !!requestedFunds.value,
        event: handleRequestFunds,
    },
    {
        title: i18n.get('capital.common.actions.goBack'),
        event: handleBack,
    },
]);
</script>

<template>
    <div :class="styles.root" data-testid="capital-offer-summary">
        <CapitalError
            v-if="requestFundsError && !balanceAccountError"
            :error="requestFundsError"
            :on-go-back="resetRequestedFunds"
            :on-contact-support="props.onContactSupport"
        />
        <template v-else>
            <div :class="styles.highlights">
                <RenewalHighlights
                    v-if="renewableGrant"
                    :contract-type="props.offer.contractType"
                    :new-grant-amount-value="props.offer.grantAmount.value"
                    :remaining-grant-amount="renewableGrant.remainingGrantAmount"
                />
                <Highlights :items="highlights" />
            </div>
            <OfferSummaryDetails :capital-state="props.capitalState" :grant-offer="props.offer" :has-balance-account-error="!!balanceAccountError" />
            <BentoAlert v-if="balanceAccountError" type="warning">
                <template #default>
                    {{ i18n.get(balanceAccountError.title) }}
                </template>
                <template #description>
                    {{ i18n.get(balanceAccountError.message) }}
                </template>
                <template v-if="props.onContactSupport" #actions>
                    <BentoButton variant="tertiary" @click="props.onContactSupport">
                        {{ i18n.get('capital.common.actions.contactSupport.labels.reachOut') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <BentoTypography v-if="props.offer.contractType === 'cashAdvance'" variant="caption">
                {{ i18n.get('capital.common.fields.expectedRepaymentPeriodDescription.cashAdvance') }}
            </BentoTypography>
            <BentoAlert v-if="isEarlyRenewal">
                <template #default>
                    {{ getContractCopy('capital.offer.summary.renewalNotice.title', props.offer.contractType) }}
                </template>
                <template #description>
                    {{ getContractCopy('capital.offer.summary.renewalNotice.description', props.offer.contractType) }}
                    <template v-if="props.offer.contractType === 'cashAdvance'">
                        <p>
                            <strong>{{ i18n.get('capital.offer.summary.renewalNotice.nextSteps.title.cashAdvance') }}</strong>
                        </p>
                        <ul>
                            <li>
                                {{ i18n.get('capital.offer.summary.renewalNotice.nextSteps.acceptedItem.cashAdvance') }}
                            </li>
                            <li>
                                {{ i18n.get('capital.offer.summary.renewalNotice.nextSteps.declinedItem.cashAdvance') }}
                            </li>
                        </ul>
                    </template>
                </template>
            </BentoAlert>
            <BentoAlert v-if="props.offer.contractType === 'cashAdvance'" variant="tip">
                <template #description>
                    {{ i18n.get('capital.offer.regulatoryNotice.cashAdvance') }}
                </template>
            </BentoAlert>
            <LegalNotice :region="props.capitalState.region" />
            <BentoButtonActions :actions="actions" />
        </template>
    </div>
</template>
