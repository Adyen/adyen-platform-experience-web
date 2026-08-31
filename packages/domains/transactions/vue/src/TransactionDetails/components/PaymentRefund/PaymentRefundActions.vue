<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { BentoButtonActions } from '@adyen/bento-vue3';
import type { RefundReason, RefundResult } from '../../../../../domain/src';
import layoutStyles from '../TransactionDataLayout.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { transactionDetailsEventBridge } from '../../../events';

const props = defineProps<{
    beginRefund: () => void;
    currency: string;
    disabled: boolean;
    maxAmount: number;
    refundAmount: number;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    refundReason: RefundReason;
    setRefundInProgress: (inProgress: boolean) => void;
    setRefundResult: (result: RefundResult) => void;
    showDetails: () => void;
    transactionId: string;
}>();

const { i18n, runtime } = useTransactionsContext();
const events = transactionDetailsEventBridge.useEvents();

const isLoading = ref(false);

const amountWithinRange = computed(() => props.refundAmount > 0 && props.refundAmount <= props.maxAmount);
const isFullRefund = computed(() => props.refundedAmount === 0 && props.refundingAmounts.length === 0 && props.refundAmount === props.maxAmount);
const refundDisabled = computed(() => props.disabled || isLoading.value || !runtime.canRefund || !amountWithinRange.value);

const refundButtonLabel = computed(() => {
    if (isLoading.value) {
        return `${i18n.get('transactions.details.refund.actions.refund.labels.inProgress')}..`;
    }
    if (amountWithinRange.value) {
        const values = { amount: i18n.amount(props.refundAmount, props.currency) };
        return i18n.get('transactions.details.refund.actions.refund.labels.amount', { values });
    }
    return i18n.get('transactions.details.refund.actions.refund.labels.payment');
});

watch(isLoading, v => props.setRefundInProgress(v));

async function handleRefund() {
    if (refundDisabled.value) return;

    props.beginRefund();
    events.refundCompleted({
        full: isFullRefund.value,
        reason: props.refundReason,
        transactionId: props.transactionId,
    });

    refundController?.abort();
    const requestController = new AbortController();
    refundController = requestController;
    isLoading.value = true;
    try {
        await runtime.initiateRefund({
            amount: { currency: props.currency, value: props.refundAmount },
            refundReason: props.refundReason,
            signal: requestController.signal,
            transactionId: props.transactionId,
        });
        if (requestController.signal.aborted) return;
        props.setRefundResult('done');
    } catch {
        if (!requestController.signal.aborted) props.setRefundResult('error');
    } finally {
        if (!requestController.signal.aborted) isLoading.value = false;
    }
}

let refundController: AbortController | undefined;

const primaryAction = computed(() => ({
    disabled: refundDisabled.value,
    event: handleRefund,
    title: refundButtonLabel.value,
    variant: 'primary' as const,
    state: isLoading.value ? ('loading' as const) : undefined,
}));

const secondaryAction = computed(() => ({
    disabled: props.disabled,
    event: props.showDetails,
    title: i18n.get('transactions.details.refund.actions.back'),
    variant: 'secondary' as const,
}));

onUnmounted(() => refundController?.abort());
</script>

<template>
    <div :class="[layoutStyles.container, layoutStyles.actionBar]">
        <BentoButtonActions :actions="[primaryAction, secondaryAction]" />
    </div>
</template>
