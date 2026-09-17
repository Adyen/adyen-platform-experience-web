<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoDropdown, BentoTypography } from '@adyen/bento-vue3';
import { getTransactionRefundReason, REFUND_REASONS } from '../../../../../domain/src';
import type { RefundReason } from '../../../../../domain/src';
import layoutStyles from '../TransactionDataLayout.module.scss';
import styles from './PaymentRefund.module.scss';

const props = defineProps<{
    disabled: boolean;
    reason: RefundReason;
}>();

const emit = defineEmits<{
    change: [reason: RefundReason];
}>();

const { i18n } = useCoreContext();

const refundReasons = computed(() =>
    REFUND_REASONS.map(r => ({
        label: getTransactionRefundReason(i18n, r) as string,
        value: r,
    }))
);

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    if (nextValue !== undefined) emit('change', String(nextValue) as RefundReason);
}
</script>

<template>
    <div :class="layoutStyles.container">
        <div :class="styles.inputHead">
            <BentoTypography variant="body" stronger>{{ i18n.get('transactions.details.refund.inputs.reason.label') }}</BentoTypography>
        </div>
        <div>
            <BentoDropdown
                :placeholder="i18n.get('transactions.details.refund.inputs.reason.label')"
                :items="refundReasons"
                :model-value="props.reason"
                :disabled="props.disabled"
                @update:model-value="onUpdate"
            />
        </div>
    </div>
</template>
