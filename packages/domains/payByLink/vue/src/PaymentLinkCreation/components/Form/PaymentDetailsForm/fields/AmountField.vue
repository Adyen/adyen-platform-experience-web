<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import type { BentoInputDropdownProps } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import { MAX_AMOUNT } from '../../../../../../../domain/src';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmount, normalizeAmountInput } from '@integration-components/core/Localization/amount/amount-util';
import './AmountField.scss';

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
    class: 'adyen-pe-payment-link-creation-form__amount-currency',
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

function onAmountInput(value: string | number) {
    const normalizedAmount = normalizeAmountInput(value, i18n.locale, currencyValue.value, MAX_AMOUNT);
    const input = amountInput.value?.$el.querySelector('input');
    if (input instanceof HTMLInputElement) input.value = normalizedAmount.displayValue;
    displayValue.value = normalizedAmount.displayValue;
    amountUpdatedFromInput = true;
    wizard.setValue('amount.value', normalizedAmount.amount);
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
            class="adyen-pe-payment-link-creation-form__amount-value"
            :variant="variant"
            :label="props.label"
            type="number"
            :model-value="displayValue"
            :lang="i18n.locale"
            :min="0"
            :max="MAX_AMOUNT"
            :readonly="valueConfig.readOnly"
            :error="!!error"
            :dropdown="dropdownProps"
            dropdown-position="start"
            @update:model-value="onAmountInput"
            @dropdown-input="onDropdownInput"
        />
    </FieldWrapper>
</template>
