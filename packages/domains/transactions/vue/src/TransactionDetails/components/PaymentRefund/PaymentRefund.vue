<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import PaymentRefundForm from './PaymentRefundForm.vue';
import PaymentRefundResult from './PaymentRefundResult.vue';
import { sharedTransactionDetailsEventProperties } from '@integration-components/transactions/domain';
import { ActiveView } from '@integration-components/transactions/domain';
import type { TransactionDetails, RefundResult } from '@integration-components/transactions/domain';
import type { ILineItem, IRefundMode } from '@integration-components/types';

const props = defineProps<{
    currency: string;
    disabled: boolean;
    lineItems: readonly ILineItem[];
    maxAmount: number;
    mode: IRefundMode;
    refreshTransaction: () => void;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    setActiveView: (view: ActiveView) => void;
    setLocked: (locked: boolean) => void;
    transaction: TransactionDetails;
}>();

const userEvents = useEventDispatcherContext();
const refundResult = ref<RefundResult | undefined>(undefined);
let initiatedRefund = false;

const beginRefund = () => {
    initiatedRefund = true;
};
const showDetails = () => props.setActiveView(ActiveView.DETAILS);
const lockRefunds = () => props.setLocked(true);

onMounted(() => {
    userEvents.addEvent?.('Switched to refund view', sharedTransactionDetailsEventProperties);
});

onUnmounted(() => {
    if (!initiatedRefund) {
        userEvents.addEvent?.('Cancelled refund', sharedTransactionDetailsEventProperties);
    }
});

watch([() => props.disabled, refundResult], ([disabled, result]) => {
    if (disabled && !result) showDetails();
    if (result === 'done') lockRefunds();
});
</script>

<template>
    <PaymentRefundResult v-if="refundResult" :result="refundResult" :refresh-transaction="props.refreshTransaction" :show-details="showDetails" />
    <PaymentRefundForm
        v-else
        :currency="props.currency"
        :max-amount="props.maxAmount"
        :mode="props.mode"
        :refunded-amount="props.refundedAmount"
        :refunding-amounts="props.refundingAmounts"
        :transaction="props.transaction"
        :begin-refund="beginRefund"
        :set-refund-result="(r: RefundResult) => (refundResult = r)"
        :show-details="showDetails"
    />
</template>
