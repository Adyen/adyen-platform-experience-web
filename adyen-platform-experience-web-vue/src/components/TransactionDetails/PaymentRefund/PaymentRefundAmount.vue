<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoTypography, BentoTag } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_CONTAINER_WITH_ERROR,
    TX_DATA_INPUT_HEAD,
} from '../constants';

const props = defineProps<{
    currency: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
    value: string | number;
}>();

const { i18n } = useCoreContext();

// Currency exponent (number of decimal places)
function getDivider(currency: string): number {
    try {
        const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(1);
        const fraction = parts.find(p => p.type === 'fraction');
        return fraction ? Math.pow(10, fraction.value.length) : 100;
    } catch {
        return 100;
    }
}

function getDecimalAmount(value: number, currency: string): number {
    return value / getDivider(currency);
}

const currencyExponent = computed(() => Math.log10(getDivider(props.currency)));
const refundableAmount = computed(() => parseInt(`${props.value}`, 10));
const formattedAmount = computed(() => getDecimalAmount(refundableAmount.value, props.currency).toFixed(currencyExponent.value));

const refundAmount = ref<string>(formattedAmount.value);
const validationError = ref<'excess' | 'negative' | 'required'>();

const errorMessages = computed(() => {
    const values = { amount: i18n.amount(refundableAmount.value, props.currency) };
    return {
        excess: i18n.get('transactions.details.refund.inputs.amount.errors.excess', { values }),
        negative: i18n.get('transactions.details.refund.inputs.amount.errors.negative'),
        required: i18n.get('transactions.details.refund.inputs.amount.errors.required'),
    };
});

const errorMessage = computed(() => (validationError.value ? errorMessages.value[validationError.value] : undefined));
const inputLabel = computed(() => i18n.get('transactions.details.refund.inputs.amount.label'));

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let error: typeof validationError.value;
    const value = target.value.trim();
    const amount = Math.trunc(+`${parseFloat(value)}e${currencyExponent.value}`) || 0;

    if (amount || value) {
        if (amount < 0) error = 'negative';
        if (amount > refundableAmount.value) error = 'excess';
    } else {
        error = 'required';
    }

    // Get the decimal separator based on the user's locale
    const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';

    // Limit decimal places
    const parts = value.split(decimalSeparator);
    if (parts.length === 2) {
        let decimalPart = parts[1]!;
        if (decimalPart.length >= currencyExponent.value) {
            decimalPart = decimalPart.substring(0, currencyExponent.value);
            target.value = parts[0]! + decimalSeparator + decimalPart;
        }
    }

    refundAmount.value = target.value;
    validationError.value = error;
    props.onChange?.(error ? 0 : amount);
}

// Reset when refundable amount changes
let cachedRefundable: number | undefined;
watch(refundableAmount, val => {
    if (cachedRefundable !== val) {
        cachedRefundable = val;
        refundAmount.value = formattedAmount.value;
        // Re-validate
        const amount = Math.trunc(+`${parseFloat(formattedAmount.value)}e${currencyExponent.value}`) || 0;
        validationError.value = undefined;
        props.onChange?.(amount);
    }
});
</script>

<template>
    <div :class="TX_DATA_CONTAINER">
        <div :class="TX_DATA_INPUT_HEAD">
            <bento-typography variant="body" weight="stronger">
                {{ inputLabel }}
            </bento-typography>
        </div>

        <div
            :class="{
                [TX_DATA_INPUT_CONTAINER]: true,
                [TX_DATA_INPUT_CONTAINER_SHORT]: true,
                [TX_DATA_INPUT_CONTAINER_TEXT]: true,
                [TX_DATA_INPUT_CONTAINER_WITH_ERROR]: !!errorMessage,
            }"
        >
            <label style="display: flex; align-items: center">
                <bento-tag v-if="props.currency" :label="props.currency" variant="grey" />
                <input
                    type="number"
                    :class="TX_DATA_INPUT"
                    :disabled="props.disabled"
                    :lang="i18n.locale"
                    :value="refundAmount"
                    min="0"
                    style="flex: 1; border: none; outline: none; background: transparent; padding: 8px"
                    @input="onInput"
                />
            </label>
            <div v-if="errorMessage" class="adyen-pe-input__refund-invalid-value">
                <span style="color: inherit">&#10006;</span>
                <bento-typography variant="body">
                    {{ errorMessage }}
                </bento-typography>
            </div>
        </div>
    </div>
</template>
