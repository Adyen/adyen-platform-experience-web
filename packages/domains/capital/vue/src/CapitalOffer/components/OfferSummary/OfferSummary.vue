<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, type BentoButtonActionsList, BentoTypography } from '@adyen/bento-vue3';
import {
    getBalanceAccountErrorMessage,
    sharedCapitalOfferAnalyticsEventProperties,
    SHARED_CONTRACT_KEYS,
    type EnhancedCapitalState,
    type OnSubmitCallback,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IContractType, IOffer } from '@integration-components/types';
import { useRequestFunds } from '../../composables/useRequestFunds';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import CapitalError from '../../../shared/CapitalError.vue';
import Highlights from '../Highlights/Highlights.vue';
import LegalNotice from '../LegalNotice/LegalNotice.vue';
import RenewalHighlights from '../RenewalHighlights/RenewalHighlights.vue';
import OfferSummaryDetails from '../OfferSummaryDetails/OfferSummaryDetails.vue';
import RegulatoryNotice from '../RegulatoryNotice/RegulatoryNotice.vue';
import { CONTRACT_KEYS } from './contractKeys';
import styles from './OfferSummary.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    contractType: IContractType;
    offer: IOffer;
    onBack: () => void;
    onContactSupport?: () => void;
    onSubmit?: OnSubmitCallback;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const renewableGrant = computed(() => props.capitalState.renewableGrants[0]);
const isEarlyRenewal = computed(() => !!renewableGrant.value);
const { getContractCopy } = useContractCopy(() => props.contractType);
const offerAmount = computed(() => i18n.amount(props.offer.grantAmount.value, props.offer.grantAmount.currency, { minimumFractionDigits: 0 }));
const highlights = computed(() => [
    {
        label: isEarlyRenewal.value ? getContractCopy(SHARED_CONTRACT_KEYS.newGrantAmount) : getContractCopy(SHARED_CONTRACT_KEYS.financing),
        value: offerAmount.value,
    },
    {
        align: 'center' as const,
        value: '+',
    },
    {
        label: i18n.get('capital.common.fields.fees.label'),
        value: i18n.amount(props.offer.feesAmount.value, props.offer.feesAmount.currency, { minimumFractionDigits: 0 }),
    },
    {
        align: 'center' as const,
        value: '=',
    },
    {
        label: getContractCopy(SHARED_CONTRACT_KEYS.totalRepaymentAmount),
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

const expectedRepaymentPeriodDescription = computed(() => getContractCopy(SHARED_CONTRACT_KEYS.expectedRepaymentPeriodDescription));
const renewalSecondaryTitle = computed(() => getContractCopy(CONTRACT_KEYS.renewalSecondaryTitle));
const renewalAcceptanceDescription = computed(() => getContractCopy(CONTRACT_KEYS.renewalAcceptanceDescription));
const renewalDeclineDescription = computed(() => getContractCopy(CONTRACT_KEYS.renewalDeclineDescription));

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
        title: i18n.get('capital.offer.summary.submit', { values: { amount: offerAmount.value } }),
        state: isRequestFundsLoading.value ? 'loading' : undefined,
        disabled: !!requestFundsError.value || !!requestedFunds.value,
        event: handleRequestFunds,
    },
    {
        title: i18n.get('capital.common.goBack.label'),
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
            <div v-if="renewableGrant" :class="styles.titledContainer">
                <BentoTypography variant="body" stronger>
                    {{ getContractCopy(CONTRACT_KEYS.earlyRenewalBreakdownTitle) }}
                </BentoTypography>
                <RenewalHighlights
                    :contract-type="props.contractType"
                    :new-grant-amount-value="props.offer.grantAmount.value"
                    :remaining-grant-amount="renewableGrant.remainingGrantAmount"
                />
            </div>
            <div :class="styles.titledContainer">
                <BentoTypography v-if="isEarlyRenewal" variant="body" stronger>
                    {{ getContractCopy(CONTRACT_KEYS.newGrantBreakdownTitle) }}
                </BentoTypography>
                <Highlights :items="highlights" />
            </div>
            <div :class="styles.titledContainer">
                <BentoTypography v-if="isEarlyRenewal" variant="body" stronger>
                    {{ getContractCopy(CONTRACT_KEYS.compareGrantsTitle) }}
                </BentoTypography>
                <OfferSummaryDetails
                    :capital-state="props.capitalState"
                    :contract-type="props.contractType"
                    :grant-offer="props.offer"
                    :has-balance-account-error="!!balanceAccountError"
                />
            </div>
            <BentoAlert v-if="balanceAccountError" type="warning">
                <template #default>
                    {{ i18n.get(balanceAccountError.title) }}
                </template>
                <template #description>
                    {{ i18n.get(balanceAccountError.message) }}
                </template>
                <template v-if="props.onContactSupport" #actions>
                    <BentoButton variant="tertiary" @click="props.onContactSupport">
                        {{ i18n.get('capital.common.contactSupport.label') }}
                    </BentoButton>
                </template>
            </BentoAlert>
            <BentoTypography v-if="expectedRepaymentPeriodDescription" variant="caption">
                {{ expectedRepaymentPeriodDescription }}
            </BentoTypography>
            <BentoAlert v-if="isEarlyRenewal">
                <template #default>
                    {{ getContractCopy(CONTRACT_KEYS.renewalTitle) }}
                </template>
                <template #description>
                    {{ getContractCopy(CONTRACT_KEYS.renewalDescription) }}
                    <template v-if="renewalSecondaryTitle">
                        <p>
                            <strong>{{ renewalSecondaryTitle }}</strong>
                        </p>
                        <ul>
                            <li v-if="renewalAcceptanceDescription">
                                {{ renewalAcceptanceDescription }}
                            </li>
                            <li v-if="renewalDeclineDescription">
                                {{ renewalDeclineDescription }}
                            </li>
                        </ul>
                    </template>
                </template>
            </BentoAlert>
            <RegulatoryNotice :contract-type="props.contractType" :region="props.capitalState.region" />
            <LegalNotice :region="props.capitalState.region" />
            <BentoButtonActions :actions="actions" />
        </template>
    </div>
</template>
