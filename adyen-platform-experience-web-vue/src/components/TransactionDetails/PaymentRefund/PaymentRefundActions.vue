<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { useConfigContext } from '../../../core/ConfigContext';
import { TX_DATA_ACTION_BAR, TX_DATA_CONTAINER } from '../constants';
import type { RefundReason, RefundResult } from '../types';

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

const { endpoints } = useConfigContext();
const { i18n } = useCoreContext();

const isLoading = ref(false);

const amountWithinRange = computed(() => props.refundAmount > 0 && props.refundAmount <= props.maxAmount);
const refundDisabled = computed(() => props.disabled || isLoading.value || !amountWithinRange.value);

const backButtonLabel = computed(() => i18n.get('transactions.details.refund.actions.back'));

const refundButtonLabelWithAmount = computed(() => {
    const values = { amount: i18n.amount(props.refundAmount, props.currency) };
    return i18n.get('transactions.details.refund.actions.refund.labels.amount', { values });
});

const refundButtonLabel = computed(() => {
    if (isLoading.value) {
        return `${i18n.get('transactions.details.refund.actions.refund.labels.inProgress')}..`;
    }
    if (amountWithinRange.value) {
        return refundButtonLabelWithAmount.value;
    }
    return i18n.get('transactions.details.refund.actions.refund.labels.payment');
});

watch(isLoading, val => {
    props.setRefundInProgress(val);
});

async function handleRefund() {
    if (refundDisabled.value) return;

    props.beginRefund();

    const initiateRefund = endpoints.initiateRefund;
    if (typeof initiateRefund !== 'function') return;

    isLoading.value = true;

    try {
        const path = { transactionId: props.transactionId };
        const payload = { amount: { currency: props.currency, value: props.refundAmount }, refundReason: props.refundReason };
        await initiateRefund({ contentType: 'application/json', body: payload }, { path });
        props.setRefundResult('done');
    } catch {
        props.setRefundResult('error');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div :class="[TX_DATA_CONTAINER, TX_DATA_ACTION_BAR]">
        <bento-button variant="primary" :disabled="refundDisabled" :loading="isLoading" @click="handleRefund">
            {{ refundButtonLabel }}
        </bento-button>
        <bento-button variant="secondary" :disabled="props.disabled" @click="props.showDetails">
            {{ backButtonLabel }}
        </bento-button>
    </div>
</template>
