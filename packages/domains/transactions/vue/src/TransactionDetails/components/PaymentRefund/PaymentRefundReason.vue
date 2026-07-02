<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoDropdown, BentoTypography } from '@adyen/bento-vue3';
import {
    getTransactionRefundReason,
    REFUND_REASONS,
    TX_DATA_CONTAINER,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_HEAD,
} from '../../../../../domain/src';
import type { RefundReason } from '../../../../../domain/src';

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
</script>

<template>
    <div :class="TX_DATA_CONTAINER">
        <div :class="TX_DATA_INPUT_HEAD">
            <BentoTypography variant="body" stronger>{{ i18n.get('transactions.details.refund.inputs.reason.label') }}</BentoTypography>
        </div>
        <div :class="[TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_SHORT]">
            <BentoDropdown
                :placeholder="i18n.get('transactions.details.refund.inputs.reason.label')"
                :items="refundReasons"
                :value="props.reason"
                :disabled="props.disabled"
                @change="(v: string) => emit('change', v as RefundReason)"
            />
        </div>
    </div>
</template>
