<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButtonActions } from '@adyen/bento-vue3';
import {
    sharedCapitalOfferAnalyticsEventProperties,
    type EnhancedCapitalState,
    type OnFundsRequestCallback,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
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
const highlightedFields = computed(() => [
    {
        label: i18n.get('capital.common.fields.financing'),
        value: i18n.amount(props.offer.grantAmount.value, props.offer.grantAmount.currency, { minimumFractionDigits: 0 }),
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

function handleBack() {
    props.onBack();
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing summary',
        label: 'Back to slider view',
        isEarlyRenewal: isEarlyRenewal.value,
    });
}
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.highlightedFields">
            <RenewalHighlights
                v-if="renewableGrant"
                :new-grant-amount-value="props.offer.grantAmount.value"
                :remaining-grant-amount="renewableGrant.remainingGrantAmount"
            />
            <Highlights :items="highlightedFields" />
        </div>
        <OfferSummaryDetails :capital-state="props.capitalState" :grant-offer="props.offer" />
        <BentoAlert v-if="isEarlyRenewal">
            <template #default>
                {{ i18n.get('capital.offer.summary.earlyRenewalNotice.title') }}
            </template>
            <template #description>
                {{ i18n.get('capital.offer.summary.earlyRenewalNotice.description') }}
            </template>
        </BentoAlert>
        <LegalNotice :region="props.capitalState.region" />
        <BentoButtonActions
            :actions="[
                {
                    title: i18n.get('capital.common.actions.goBack'),
                    variant: 'secondary',
                    event: handleBack,
                },
            ]"
        />
    </div>
</template>
