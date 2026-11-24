<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmount as formatInputAmount, normalizeAmountInput } from '@integration-components/core/Localization/amount/amount-util';
import { getAmountAnalyticsProperties } from '@integration-components/cashOut/domain';
import type { ICashOutAmount } from '@integration-components/types';
import { useFormatAmount } from '../../../shared/composables/useFormatAmount';
import { useCashOutAnalytics } from '../../../shared/composables/useCashOutAnalytics';

const props = defineProps<{
    disabled?: boolean;
    maxAmount: ICashOutAmount;
}>();

/** The amount in minor units, or `undefined` while the input doesn't hold an amount that can be cashed out. */
const amount = defineModel<number | undefined>({ required: true });

const { i18n } = useCoreContext();
const formatAmount = useFormatAmount();
const { track, trackValidationError } = useCashOutAnalytics();

const currency = computed(() => props.maxAmount.currency);

const inputValue = ref(amount.value === undefined ? '' : formatInputAmount(amount.value, currency.value));
const validationError = ref<'excess' | 'positive' | 'required'>();
// The amount the input holds, valid or not, or `undefined` while it holds no number.
const enteredAmount = ref(amount.value);
// The amount last told as changed, or filled in: only another one the user leaves in the field is told.
let lastToldAmount = enteredAmount.value;

const validate = (value: number) => {
    if (value <= 0) return 'positive';
    if (value > props.maxAmount.value) return 'excess';
    return undefined;
};

// What is available to cash out can change while the field is shown, such as once the available amounts are loaded again: the amount
// entered is checked against it again, and an amount set from outside, such as what is available filled in again, is shown instead.
watch([amount, () => props.maxAmount.value], ([value]) => {
    if (value !== undefined && value !== enteredAmount.value) {
        // Filled in, not changed by the user
        enteredAmount.value = lastToldAmount = value;
        inputValue.value = formatInputAmount(value, currency.value);
    }
    if (enteredAmount.value === undefined) return;
    validationError.value = validate(enteredAmount.value);
    amount.value = validationError.value ? undefined : enteredAmount.value;
});

const errorMessage = computed(() => {
    switch (validationError.value) {
        case 'excess':
            return i18n.get('cashOut.request.fields.amount.errors.excess', { values: { amount: formatAmount(props.maxAmount) } });
        case 'positive':
            return i18n.get('cashOut.request.fields.amount.errors.positive');
        case 'required':
            return i18n.get('cashOut.request.fields.amount.errors.required');
        default:
            return undefined;
    }
});

const inputField = ref<InstanceType<typeof BentoInputField> | null>(null);

// A number input reports an unfinished number, like "434." or "-", as an empty value with `validity.badInput`.
const hasIncompleteNumber = () => !!inputField.value?.inputFieldElement?.validity.badInput;

// Each error the field starts showing, whether from what was entered or from what is available changing.
watch(validationError, error => {
    if (error) trackValidationError(error);
});

// Told once the user leaves the field, not while typing, and only when the amount differs from the last one told, or filled in.
const tellChangedAmount = () => {
    if (enteredAmount.value === lastToldAmount) return;
    lastToldAmount = enteredAmount.value;
    const entered = enteredAmount.value === undefined ? undefined : { value: enteredAmount.value, currency: currency.value };
    track('Changed amount', { ...getAmountAnalyticsProperties(entered, props.maxAmount), isValid: !validationError.value });
};

function onBlur() {
    if (hasIncompleteNumber()) {
        enteredAmount.value = undefined;
        amount.value = undefined;
    }
    // Asked for only once the field is left without one, as the user may be about to type another amount
    if (enteredAmount.value === undefined) validationError.value = 'required';
    tellChangedAmount();
}

function onInput(rawValue: string) {
    // Validated on blur instead, so the user can finish typing.
    if (rawValue === '' && hasIncompleteNumber()) return;

    const { displayValue: value, amount: nextAmount, localeDecimalSeparator } = normalizeAmountInput(rawValue, i18n.locale, currency.value);
    const isInvalid = Number.isNaN(Number.parseFloat(value.replace(localeDecimalSeparator, '.')));

    if (value !== rawValue) {
        const inputElement = inputField.value?.inputFieldElement;
        if (inputElement) inputElement.value = value;
    }

    const hasNumber = !isInvalid && value !== '';
    // Without a number nothing can be cashed out, but the amount is only asked for once the field is left, see onBlur
    const error = hasNumber ? validate(nextAmount) : undefined;

    inputValue.value = value;
    enteredAmount.value = hasNumber ? nextAmount : undefined;
    validationError.value = error;
    amount.value = error || !hasNumber ? undefined : nextAmount;
}
</script>

<template>
    <BentoInputField
        ref="inputField"
        variant="static-value"
        static-value-position="end"
        type="number"
        :disabled="props.disabled"
        :error-message="errorMessage"
        :label="i18n.get('cashOut.request.fields.amount.label')"
        :lang="i18n.locale"
        :min="0"
        :model-value="inputValue"
        @blur="onBlur"
        @update:model-value="onInput"
    >
        <template #staticValue>{{ currency }}</template>
    </BentoInputField>
</template>
