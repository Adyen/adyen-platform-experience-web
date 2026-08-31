<script setup lang="ts">
import { ref, computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import PaymentRefundNotice from './PaymentRefundNotice.vue';
import PaymentRefundReason from './PaymentRefundReason.vue';
import PaymentRefundAmount from './PaymentRefundAmount.vue';
import PaymentRefundActions from './PaymentRefundActions.vue';
import { REFUND_REASONS, RefundMode } from '../../../../../domain/src';
import { clamp } from '@integration-components/utils';
import type { TransactionDetails, RefundReason, RefundResult } from '../../../../../domain/src';
import type { IRefundMode } from '@integration-components/types';
import layoutStyles from '../TransactionDataLayout.module.scss';
import { useTransactionsContext } from '../../../integration/context';

const props = defineProps<{
    currency: string;
    maxAmount: number;
    mode: IRefundMode;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    transaction: TransactionDetails;
    beginRefund: () => void;
    setRefundResult: (result: RefundResult) => void;
    showDetails: () => void;
}>();

const { i18n } = useTransactionsContext();

const refundInProgress = ref(false);
const refundReason = ref<RefundReason>(REFUND_REASONS[0]);
const refundAmount = ref(0);

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
    if (props.maxAmount <= 0) return null;
    const values = { amount: i18n.amount(props.maxAmount, props.currency) };
    switch (props.mode) {
        case RefundMode.FULL_AMOUNT:
            return i18n.get('transactions.details.refund.alerts.refundableAmount', { values });
        case RefundMode.PARTIAL_AMOUNT:
            return i18n.get('transactions.details.refund.alerts.refundableMaximum', { values });
        default:
            return null;
    }
});

function onAmountChange(value: number) {
    refundAmount.value = clamp(0, value, amount.value);
}
</script>

<template>
    <div :class="layoutStyles.root">
        <PaymentRefundNotice />
        <PaymentRefundReason :disabled="refundInProgress" :reason="refundReason" @change="(r: RefundReason) => (refundReason = r)" />
        <PaymentRefundAmount
            :currency="props.currency"
            :disabled="refundInProgress || props.mode !== RefundMode.PARTIAL_AMOUNT"
            :value="amount"
            @change="onAmountChange"
        />
        <BentoAlert v-if="maxAmountAlert" type="highlight" variant="tip">
            <template #description>{{ maxAmountAlert }}</template>
        </BentoAlert>
        <PaymentRefundActions
            :begin-refund="props.beginRefund"
            :currency="props.currency"
            :disabled="refundInProgress"
            :max-amount="props.maxAmount"
            :refund-amount="refundAmount"
            :refunded-amount="props.refundedAmount"
            :refunding-amounts="props.refundingAmounts"
            :refund-reason="refundReason"
            :set-refund-in-progress="(v: boolean) => (refundInProgress = v)"
            :set-refund-result="props.setRefundResult"
            :show-details="props.showDetails"
            :transaction-id="props.transaction.id"
        />
    </div>
</template>
