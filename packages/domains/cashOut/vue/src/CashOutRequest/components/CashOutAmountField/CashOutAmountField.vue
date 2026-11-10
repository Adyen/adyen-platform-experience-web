<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmount as formatInputAmount, normalizeAmountInput } from '@integration-components/core/Localization/amount/amount-util';
import type { ICashOutAmount } from '@integration-components/types';
import { useFormatAmount } from '../../composables/useFormatAmount';

const props = defineProps<{
    disabled?: boolean;
    maxAmount: ICashOutAmount;
}>();

/** The amount in minor units, or `undefined` while the input doesn't hold an amount that can be cashed out. */
const amount = defineModel<number | undefined>({ required: true });

const { i18n } = useCoreContext();
const formatAmount = useFormatAmount();

const currency = computed(() => props.maxAmount.currency);

const inputValue = ref(amount.value === undefined ? '' : formatInputAmount(amount.value, currency.value));
const validationError = ref<'excess' | 'positive' | 'required'>();

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

function onBlur() {
    if (!hasIncompleteNumber()) return;
    validationError.value = 'required';
    amount.value = undefined;
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

    let error: typeof validationError.value;

    if (isInvalid || value === '') {
        error = 'required';
    } else if (nextAmount <= 0) {
        error = 'positive';
    } else if (nextAmount > props.maxAmount.value) {
        error = 'excess';
    }

    inputValue.value = value;
    validationError.value = error;
    amount.value = error ? undefined : nextAmount;
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
        required
        @blur="onBlur"
        @update:model-value="onInput"
    >
        <template #staticValue>{{ currency }}</template>
    </BentoInputField>
</template>
