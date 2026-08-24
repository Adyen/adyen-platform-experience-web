<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import type { BentoInputDropdownProps } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import { MAX_AMOUNT } from '../../../../../../../domain/src';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmount, getCurrencyExponent } from '@integration-components/core/Localization/amount/amount-util';
import styles from './AmountField.module.scss';

const props = defineProps<{
    label: string;
    currencyOptions?: string[];
}>();

const wizard = useWizard();
const { i18n } = useCoreContext();
const valueConfig = computed(() => wizard.getFieldConfig('amount.value'));
const currencyConfig = computed(() => wizard.getFieldConfig('amount.currency'));
const error = computed(() => wizard.getError('amount.value'));

const storedAmountValue = computed(() => (wizard.values.value['amount.value'] as string | number | undefined) ?? '');
const currencyValue = computed(() => (wizard.values.value['amount.currency'] as string | undefined) ?? '');
const displayValue = ref('');
const amountInput = ref<{ $el: HTMLElement } | null>(null);
let amountUpdatedFromInput = false;

const currencyItems = computed(() => (props.currencyOptions ?? []).map(code => ({ label: code, value: code })));

const variant = computed(() => (currencyConfig.value.visible ? 'dropdown' : 'default'));

const dropdownProps = computed<BentoInputDropdownProps>(() => ({
    items: currencyItems.value,
    modelValue: currencyValue.value,
    readonly: currencyConfig.value.readOnly,
    'aria-label': i18n.get('payByLink.creation.fields.amount.currency.ariaLabel'),
    placeholder: i18n.get('common.inputs.select.placeholder'),
    class: styles.amountCurrency,
}));

watch(
    () => props.currencyOptions,
    options => {
        if (options?.length === 1 && options[0] && !currencyValue.value) {
            wizard.setValue('amount.currency', options[0], options[0]);
        }
    },
    { immediate: true }
);

watch(
    [storedAmountValue, currencyValue],
    ([amount, currency], [, previousCurrency]) => {
        if (amountUpdatedFromInput && currency === previousCurrency) {
            amountUpdatedFromInput = false;
            return;
        }
        amountUpdatedFromInput = false;
        displayValue.value = amount === '' ? '' : formatAmount(Number(amount), currency);
    },
    { immediate: true }
);

const computedNumberAmount = (value: string) => {
    const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';
    const normalizedValue = decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.');
    const exponent = getCurrencyExponent(currencyValue.value);
    return Math.trunc(+`${parseFloat(normalizedValue)}e${exponent}`) || 0;
};

function onAmountInput(value: string) {
    // Get the decimal separator based on the user's locale
    const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';
    // Split the input value at the decimal separator
    const parts = value.split(decimalSeparator);

    if (parts.length === 2) {
        const exponent = getCurrencyExponent(currencyValue.value);

        const integerPart = parts[0]!;
        let decimalPart = parts[1]!;

        if (decimalPart.length >= exponent) {
            decimalPart = decimalPart.substring(0, exponent);
            value = integerPart + decimalSeparator + decimalPart;
        }
    }

    if (typeof MAX_AMOUNT === 'number') {
        const normalizedValue = decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.');
        const parsed = parseFloat(normalizedValue);

        if (Number.isFinite(parsed) && parsed > MAX_AMOUNT) {
            const exponent = getCurrencyExponent(currencyValue.value);
            const fixed = MAX_AMOUNT.toFixed(exponent);
            value = decimalSeparator === '.' ? fixed : fixed.replace('.', decimalSeparator);
            displayValue.value = value;
        }
    }
    amountUpdatedFromInput = true;
    wizard.setValue('amount.value', computedNumberAmount(value));
}

function onDropdownInput(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    if (next === undefined) return;
    wizard.setValue('amount.currency', String(next), String(next));
    if (error.value) wizard.validateField('amount.value');
}
</script>

<template>
    <FieldWrapper v-if="valueConfig.visible" name="amount.value" :error="error">
        <BentoInputField
            ref="amountInput"
            :variant="variant"
            :label="props.label"
            type="text"
            inputmode="decimal"
            :model-value="displayValue"
            :lang="i18n.locale"
            :min="0"
            :max="MAX_AMOUNT"
            :readonly="valueConfig.readOnly"
            :error="!!error"
            :dropdown="dropdownProps"
            dropdown-position="start"
            @input="onAmountInput"
            @dropdown-input="onDropdownInput"
        />
    </FieldWrapper>
</template>
