<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import type { BentoInputDropdownProps } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import { MAX_AMOUNT } from '../../../../../../../domain/src';
import { useCoreContext } from '@integration-components/core/vue';
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

const amountValue = computed(() => (wizard.values.value['amount.value'] as string | number | undefined) ?? '');
const currencyValue = computed(() => (wizard.values.value['amount.currency'] as string | undefined) ?? '');

const currencyItems = computed(() => (props.currencyOptions ?? []).map(code => ({ label: code, value: code })));

const variant = computed(() => (currencyConfig.value.visible ? 'dropdown' : 'default'));

const dropdownProps = computed<BentoInputDropdownProps>(() => ({
    items: currencyItems.value,
    modelValue: currencyValue.value,
    readonly: currencyConfig.value.readOnly,
    'aria-label': `${props.label} currency`,
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

function onAmountInput(value: string | number) {
    wizard.setValue('amount.value', value);
}

function onDropdownInput(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    if (next === undefined) return;
    wizard.setValue('amount.currency', String(next), String(next));
    wizard.clearError('amount.value');
}
</script>

<template>
    <FieldWrapper v-if="valueConfig.visible" name="amount.value" :error="error">
        <BentoInputField
            class="adyen-pe-payment-link-creation-form__amount-value"
            :variant="variant"
            :label="props.label"
            type="number"
            :model-value="amountValue"
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
