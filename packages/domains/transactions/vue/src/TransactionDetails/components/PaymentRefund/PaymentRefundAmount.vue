<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoInputField, BentoTypography } from '@adyen/bento-vue3';
import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_CONTAINER_WITH_ERROR,
    TX_DATA_INPUT_HEAD,
} from '@integration-components/transactions/domain';
import { getDecimalAmount, getDivider } from '@integration-components/core/Localization/amount/amount-util';
import { useUniqueId } from '@integration-components/composables-vue';

const props = defineProps<{
    currency: string;
    disabled?: boolean;
    value: string | number;
}>();

const emit = defineEmits<{
    change: [value: number];
}>();

const { i18n } = useCoreContext();
const inputId = useUniqueId();

const currencyExponent = computed(() => Math.log10(getDivider(props.currency)));
const refundableAmount = computed(() => parseInt(`${props.value}`, 10));
const formattedDefault = computed(() => getDecimalAmount(refundableAmount.value, props.currency).toFixed(currencyExponent.value));

const inputValue = ref<string>(formattedDefault.value);
const validationError = ref<'excess' | 'negative' | 'required' | undefined>(undefined);

const errorMessages = computed(() => {
    const values = { amount: i18n.amount(refundableAmount.value, props.currency) };
    return {
        excess: i18n.get('transactions.details.refund.inputs.amount.errors.excess', { values }),
        negative: i18n.get('transactions.details.refund.inputs.amount.errors.negative'),
        required: i18n.get('transactions.details.refund.inputs.amount.errors.required'),
    };
});

const errorMessage = computed(() => validationError.value && errorMessages.value[validationError.value]);

const containerClass = computed(() => ({
    [TX_DATA_INPUT_CONTAINER]: true,
    [TX_DATA_INPUT_CONTAINER_SHORT]: true,
    [TX_DATA_INPUT_CONTAINER_TEXT]: true,
    [TX_DATA_INPUT_CONTAINER_WITH_ERROR]: !!errorMessage.value,
}));

watch(
    () => props.value,
    () => {
        inputValue.value = formattedDefault.value;
        validationError.value = undefined;
        emit('change', refundableAmount.value);
    },
    { immediate: true }
);

function onInput(rawValue: string) {
    const value = rawValue.trim();
    const exp = currencyExponent.value;
    const parsed = parseFloat(value);
    const amount = isNaN(parsed) ? 0 : Math.trunc(+`${parsed}e${exp}`);

    let error: typeof validationError.value;
    if (isNaN(parsed) || value === '') {
        error = 'required';
    } else if (amount < 0) {
        error = 'negative';
    } else if (amount > refundableAmount.value) {
        error = 'excess';
    }

    inputValue.value = value;
    validationError.value = error;
    emit('change', error ? 0 : amount);
}
</script>

<template>
    <div :class="TX_DATA_CONTAINER">
        <div :class="TX_DATA_INPUT_HEAD">
            <BentoTypography variant="body" stronger>{{ i18n.get('transactions.details.refund.inputs.amount.label') }}</BentoTypography>
        </div>
        <div :class="containerClass">
            <BentoInputField
                :id="inputId"
                variant="static-value"
                type="number"
                :disabled="props.disabled"
                :value="inputValue"
                :min="0"
                :errorMessage="errorMessage || undefined"
                :lang="i18n.locale"
                @input="onInput"
            >
                <template v-if="props.currency" #staticValue>{{ props.currency }}</template>
            </BentoInputField>
        </div>
    </div>
</template>
