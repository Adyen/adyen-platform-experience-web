<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';

// A zero balance already shows as an amount of 0, so it gets no alert.
const UNAVAILABLE_REASON_MESSAGES = {
    zeroBalance: undefined,
    noInstantReachableTransferInstruments: 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments',
    cashOutInProgress: 'cashOut.common.unavailableReasons.cashOutInProgress',
    dailyLimitReached: 'cashOut.common.unavailableReasons.dailyLimitReached',
    sendToBalanceAccountNotAllowed: 'cashOut.common.unavailableReasons.notAllowed',
    receiveFromBalanceAccountNotAllowed: 'cashOut.common.unavailableReasons.notAllowed',
    riskRestricted: 'cashOut.common.unavailableReasons.riskRestricted',
    cashOutNotConfigured: 'cashOut.common.unavailableReasons.notAllowed',
} as const satisfies Record<ICashOutUnavailableReason, TranslationKey | undefined>;

type UnavailableReasonMessage = NonNullable<(typeof UNAVAILABLE_REASON_MESSAGES)[ICashOutUnavailableReason]>;

// Messages that ask the user to contact support, so the alert offers the contact support action.
const SUPPORT_REASON_MESSAGES = new Set<UnavailableReasonMessage>(['cashOut.common.unavailableReasons.notAllowed']);

const props = defineProps<{
    eligibility: ICashOutEligibility;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();

const message = computed<UnavailableReasonMessage | undefined>(() => {
    if (props.eligibility.isCashoutAvailable) return undefined;
    const [reason] = props.eligibility.unavailableReasons;
    if (reason === 'zeroBalance') return undefined;
    // The generic message covers a missing reason, and one added to the API that the component doesn't know yet.
    return (reason && UNAVAILABLE_REASON_MESSAGES[reason]) || 'cashOut.common.unavailableReasons.notAllowed';
});

const showContactSupport = computed(() => {
    const currentMessage = message.value;
    return Boolean(currentMessage && SUPPORT_REASON_MESSAGES.has(currentMessage) && props.onContactSupport);
});
</script>

<template>
    <BentoAlert v-if="message" type="warning" role="status">
        <template #description>{{ i18n.get(message) }}</template>
        <template v-if="showContactSupport" #actions>
            <BentoButton variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('cashOut.common.actions.contactSupport.labels.reachOut') }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
