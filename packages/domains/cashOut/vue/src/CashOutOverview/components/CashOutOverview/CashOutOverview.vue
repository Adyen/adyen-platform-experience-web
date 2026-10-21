<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoAlert, BentoButton, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { ComponentShell, useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutUnavailableReason } from '@integration-components/types';
import { CashOutOverviewProps } from '../../types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import CashOutOverviewSkeleton from '../CashOutOverviewSkeleton/CashOutOverviewSkeleton.vue';
import CashOutRequestModal from '../CashOutRequestModal/CashOutRequestModal.vue';
import styles from './CashOutOverview.module.scss';

// A zero balance already shows as an amount of 0, so it gets no alert.
const UNAVAILABLE_REASON_MESSAGES = {
    zeroBalance: undefined,
    noInstantReachableTransferInstruments: 'cashOut.overview.unavailableReasons.noInstantReachableTransferInstruments',
    cashOutInProgress: 'cashOut.overview.unavailableReasons.cashOutInProgress',
    dailyLimitReached: 'cashOut.overview.unavailableReasons.dailyLimitReached',
    sendToBalanceAccountNotAllowed: 'cashOut.overview.unavailableReasons.notAllowed',
    receiveFromBalanceAccountNotAllowed: 'cashOut.overview.unavailableReasons.notAllowed',
    riskRestricted: 'cashOut.overview.unavailableReasons.riskRestricted',
    cashOutNotConfigured: 'cashOut.overview.unavailableReasons.notAllowed',
} as const satisfies Record<ICashOutUnavailableReason, TranslationKey | undefined>;

type UnavailableReasonMessage = NonNullable<(typeof UNAVAILABLE_REASON_MESSAGES)[ICashOutUnavailableReason]>;

// Messages that ask the user to contact support, so the alert offers the contact support action.
const SUPPORT_REASON_MESSAGES = new Set<UnavailableReasonMessage>(['cashOut.overview.unavailableReasons.notAllowed']);

const props = defineProps<CashOutOverviewProps>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();

const { balanceAccountOptions, eligibility, errorInfo, selectedBalanceAccountId, shellState } = useCashOutState();

const unavailableReasonMessage = computed<UnavailableReasonMessage | undefined>(() => {
    if (!eligibility.value || eligibility.value.isCashoutAvailable) return undefined;
    const [reason] = eligibility.value.unavailableReasons;
    if (reason === 'zeroBalance') return undefined;
    // The generic message covers a missing reason, and one added to the API that the component doesn't know yet.
    return (reason && UNAVAILABLE_REASON_MESSAGES[reason]) || 'cashOut.overview.unavailableReasons.notAllowed';
});

const showUnavailableReasonContactSupport = computed(() => {
    const message = unavailableReasonMessage.value;
    return Boolean(message && SUPPORT_REASON_MESSAGES.has(message) && props.onContactSupport);
});

const isRequestModalOpen = ref(false);

const openRequestModal = () => {
    isRequestModalOpen.value = true;
};

const closeRequestModal = () => {
    isRequestModalOpen.value = false;
};
</script>

<template>
    <div :class="styles.root">
        <CashOutHeader
            v-model:selected-balance-account-id="selectedBalanceAccountId"
            :balance-account-options="balanceAccountOptions"
            :hide-title="hideTitles"
            title-key="cashOut.overview.title"
        />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutOverviewSkeleton />
            </template>
            <div v-if="eligibility" :class="styles.content">
                <div :class="styles.availableForCashOut">
                    <div :class="styles.availableForCashOutLabel">
                        <BentoTypography variant="body">{{ i18n.get('cashOut.overview.availableForCashOut.label') }}</BentoTypography>
                        <BentoInfoIcon :tooltip-text="i18n.get('cashOut.overview.availableForCashOut.tooltip')" />
                    </div>
                    <BentoTypography variant="title" large>
                        {{ i18n.amount(eligibility.availableForCashOutBalance.value, eligibility.availableForCashOutBalance.currency) }}
                    </BentoTypography>
                </div>
                <BentoAlert v-if="unavailableReasonMessage" type="warning" role="status">
                    <template #description>{{ i18n.get(unavailableReasonMessage) }}</template>
                    <template v-if="showUnavailableReasonContactSupport" #actions>
                        <BentoButton variant="tertiary" @click="props.onContactSupport">
                            {{ i18n.get('cashOut.common.actions.contactSupport.labels.reachOut') }}
                        </BentoButton>
                    </template>
                </BentoAlert>
                <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable" @click="openRequestModal">
                    {{ i18n.get('cashOut.overview.actions.start') }}
                </BentoButton>
            </div>
        </ComponentShell>
        <CashOutRequestModal
            :balance-account-id="selectedBalanceAccountId"
            :eligibility="eligibility"
            :is-open="isRequestModalOpen"
            :on-close="closeRequestModal"
        />
    </div>
</template>
