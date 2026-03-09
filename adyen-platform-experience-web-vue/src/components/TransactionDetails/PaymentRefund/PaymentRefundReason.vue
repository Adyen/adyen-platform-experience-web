<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import {
    REFUND_REASONS,
    REFUND_REASONS_KEYS,
    TX_DATA_CONTAINER,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_HEAD,
} from '../constants';
import type { RefundReason } from '../types';

const props = defineProps<{
    disabled: boolean;
    reason: RefundReason;
    onChange: (reason: RefundReason) => void;
}>();

const { i18n } = useCoreContext();

const selectLabel = computed(() => i18n.get('transactions.details.refund.inputs.reason.label'));

const refundReasons = computed(() =>
    REFUND_REASONS.map(reason => ({
        label: (REFUND_REASONS_KEYS[reason] ? i18n.get(REFUND_REASONS_KEYS[reason]!) : reason) as string,
        value: reason,
    }))
);

function onReasonChange(value: string) {
    props.onChange(value);
}
</script>

<template>
    <div :class="TX_DATA_CONTAINER">
        <div :class="TX_DATA_INPUT_HEAD">
            <bento-typography variant="body" weight="stronger">
                {{ selectLabel }}
            </bento-typography>
        </div>

        <div :class="[TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_SHORT]">
            <select
                :disabled="props.disabled"
                :value="props.reason"
                class="adyen-pe-transaction-data__select"
                @change="onReasonChange(($event.target as HTMLSelectElement).value)"
            >
                <option v-for="reason in refundReasons" :key="reason.value" :value="reason.value">
                    {{ reason.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.adyen-pe-transaction-data__select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--adyen-sdk-color-outline-secondary, #d4d9e2);
    border-radius: 8px;
    background: var(--adyen-sdk-color-background-primary, #fff);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    cursor: pointer;
}

.adyen-pe-transaction-data__select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
