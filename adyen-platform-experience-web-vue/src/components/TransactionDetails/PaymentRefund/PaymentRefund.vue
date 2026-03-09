<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import PaymentRefundNotice from './PaymentRefundNotice.vue';
import PaymentRefundReason from './PaymentRefundReason.vue';
import PaymentRefundAmount from './PaymentRefundAmount.vue';
import PaymentRefundActions from './PaymentRefundActions.vue';
import {
    REFUND_REASONS,
    TX_DATA_CLASS,
    TX_REFUND_RESPONSE,
    TX_REFUND_RESPONSE_ICON,
    TX_REFUND_RESPONSE_SUCCESS_ICON,
    TX_REFUND_RESPONSE_ERROR_ICON,
} from '../constants';
import { ActiveView, RefundMode, type RefundReason, type RefundResult, type TransactionDetails, type ILineItem } from '../types';

const props = defineProps<{
    currency: string;
    disabled: boolean;
    lineItems: readonly ILineItem[];
    maxAmount: number;
    mode: string;
    refreshTransaction: () => void;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    setActiveView: (activeView: ActiveView) => void;
    setLocked: (locked: boolean) => void;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const refundResult = ref<RefundResult>();
const refundInProgress = ref(false);
const refundReason = ref<RefundReason>(REFUND_REASONS[0]!);
const refundAmount = ref(0);

function showDetails() {
    props.setActiveView(ActiveView.DETAILS);
}

function beginRefund() {
    // Mark that a refund was initiated
}

function setRefundResult(result: RefundResult) {
    refundResult.value = result;
}

function lockRefunds() {
    props.setLocked(true);
}

// If disabled while no result, go back to details
// If result is done, lock refunds
watch([() => props.disabled, refundResult], ([disabled, result]) => {
    if (disabled && !result) showDetails();
    if (result === 'done') lockRefunds();
});

// Refund amount computation
const amount = computed(() => {
    switch (props.mode) {
        case RefundMode.FULL_AMOUNT:
        case RefundMode.PARTIAL_AMOUNT:
        case RefundMode.PARTIAL_LINE_ITEMS:
            return props.maxAmount;
        default:
            return 0;
    }
});

const maxAmountAlert = computed(() => {
    if (props.maxAmount > 0) {
        const amount = i18n.amount(props.maxAmount, props.currency);
        switch (props.mode) {
            case RefundMode.FULL_AMOUNT:
                return i18n.get('transactions.details.refund.alerts.refundableAmount', { amount });
            case RefundMode.PARTIAL_AMOUNT:
                return i18n.get('transactions.details.refund.alerts.refundableMaximum', { amount });
        }
    }
    return undefined;
});

function onAmountChange(value: number) {
    refundAmount.value = Math.max(0, Math.min(value, amount.value));
}

function handleShowDetailsAndRefresh() {
    showDetails();
    props.refreshTransaction();
}

const isErrorResult = computed(() => refundResult.value === 'error');
const resultTitleKey = computed(() => (isErrorResult.value ? 'common.errors.somethingWentWrong' : 'transactions.details.refund.alerts.refundSent'));
const resultDescriptionKey = computed(() =>
    isErrorResult.value ? 'transactions.details.refund.alerts.refundFailure' : 'transactions.details.refund.alerts.refundSuccess'
);
</script>

<template>
    <!-- Refund Result -->
    <template v-if="refundResult">
        <div :class="TX_REFUND_RESPONSE">
            <div :class="[TX_REFUND_RESPONSE_ICON, isErrorResult ? TX_REFUND_RESPONSE_ERROR_ICON : TX_REFUND_RESPONSE_SUCCESS_ICON]">
                <svg v-if="isErrorResult" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
                    />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
            </div>
            <bento-typography variant="title" weight="stronger">
                {{ i18n.get(resultTitleKey) }}
            </bento-typography>
            <bento-typography variant="body">
                {{ i18n.get(resultDescriptionKey) }}
            </bento-typography>
            <bento-button variant="secondary" @click="handleShowDetailsAndRefresh">
                {{ i18n.get('transactions.details.refund.actions.back') }}
            </bento-button>
        </div>
    </template>

    <!-- Refund Form -->
    <template v-else>
        <div :class="TX_DATA_CLASS">
            <PaymentRefundNotice />
            <PaymentRefundReason
                :disabled="refundInProgress"
                :reason="refundReason"
                :on-change="
                    (reason: RefundReason) => {
                        refundReason = reason;
                    }
                "
            />

            <PaymentRefundAmount
                :currency="props.currency"
                :disabled="refundInProgress || props.mode !== RefundMode.PARTIAL_AMOUNT"
                :on-change="onAmountChange"
                :value="amount"
            />

            <!-- Max amount alert -->
            <div v-if="maxAmountAlert" class="adyen-pe-transaction-data__refund-alert">
                <bento-typography variant="body">
                    {{ maxAmountAlert }}
                </bento-typography>
            </div>

            <PaymentRefundActions
                :begin-refund="beginRefund"
                :currency="props.currency"
                :disabled="refundInProgress"
                :max-amount="props.maxAmount"
                :refund-amount="refundAmount"
                :refunded-amount="props.refundedAmount"
                :refunding-amounts="props.refundingAmounts"
                :refund-reason="refundReason"
                :set-refund-in-progress="
                    (val: boolean) => {
                        refundInProgress = val;
                    }
                "
                :set-refund-result="setRefundResult"
                :show-details="showDetails"
                :transaction-id="props.transaction.id"
            />
        </div>
    </template>
</template>

<style scoped>
.adyen-pe-transaction-data__refund-alert {
    padding: 12px 16px;
    background: var(--adyen-sdk-color-background-secondary, #f3f6f9);
    border-radius: 8px;
}
</style>
