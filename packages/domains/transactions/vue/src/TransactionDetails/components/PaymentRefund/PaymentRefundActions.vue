<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoButtonActions } from '@adyen/bento-vue3';
import { sharedTransactionDetailsEventProperties } from '../../../../../domain/src';
import { isFunction } from '@integration-components/utils';
import type { RefundReason, RefundResult } from '../../../../../domain/src';
import layoutStyles from '../TransactionDataLayout.module.scss';

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

const { i18n } = useCoreContext();
const config = useConfigContext();
const userEvents = useEventDispatcherContext();

const isLoading = ref(false);

const amountWithinRange = computed(() => props.refundAmount > 0 && props.refundAmount <= props.maxAmount);
const isFullRefund = computed(() => props.refundedAmount === 0 && props.refundingAmounts.length === 0 && props.refundAmount === props.maxAmount);
const refundDisabled = computed(() => props.disabled || isLoading.value || !amountWithinRange.value);

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
    const fn = config.endpoints.initiateRefund;
    if (!isFunction(fn)) return;

    props.beginRefund();
    userEvents.addEvent?.('Completed refund', {
        ...sharedTransactionDetailsEventProperties,
        isFullRefund: isFullRefund.value,
        refundReason: props.refundReason,
    });

    isLoading.value = true;
    try {
        await fn(
            {
                contentType: 'application/json',
                body: { amount: { currency: props.currency, value: props.refundAmount }, refundReason: props.refundReason },
            },
            { path: { transactionId: props.transactionId } }
        );
        props.setRefundResult('done');
    } catch {
        props.setRefundResult('error');
    } finally {
        isLoading.value = false;
    }
}

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
</script>

<template>
    <div :class="[layoutStyles.container, layoutStyles.actionBar]">
        <BentoButtonActions :actions="[primaryAction, secondaryAction]" />
    </div>
</template>
