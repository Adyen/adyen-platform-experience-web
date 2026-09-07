<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoInputField, BentoTypography } from '@adyen/bento-vue3';
import { getDecimalAmount, getDivider, normalizeAmountInput } from '@integration-components/core/Localization/amount/amount-util';
import { useUniqueId } from '@integration-components/composables-vue';
import layoutStyles from '../TransactionDataLayout.module.scss';
import styles from './PaymentRefund.module.scss';

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
    const { displayValue: value, amount, localeDecimalSeparator } = normalizeAmountInput(rawValue, i18n.locale, props.currency);
    const isInvalid = Number.isNaN(Number.parseFloat(value.replace(localeDecimalSeparator, '.')));
    let error: typeof validationError.value;

    if (isInvalid || value === '') {
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
    <div :class="layoutStyles.container">
        <div :class="styles.inputHead">
            <BentoTypography variant="body" stronger>{{ i18n.get('transactions.details.refund.inputs.amount.label') }}</BentoTypography>
        </div>
        <div>
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
