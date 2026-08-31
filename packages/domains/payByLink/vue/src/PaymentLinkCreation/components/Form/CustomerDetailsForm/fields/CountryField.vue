<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    items: { id: string; name: string }[];
    loading?: boolean;
    copyTo?: PaymentLinkFieldName;
    copyEnabled?: boolean;
    hideOptionalLabel?: boolean;
}>();

const wizard = useWizard();
const { i18n } = wizard;
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | undefined) ?? '');
const dropdownItems = computed(() => props.items.map(item => ({ label: item.name, value: item.id })));

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    const stringValue = next === undefined ? '' : String(next);
    const displayName = props.items.find(item => item.id === stringValue)?.name ?? stringValue;
    wizard.setValue(props.name, stringValue, displayName);
    if (props.copyEnabled && props.copyTo) wizard.setValue(props.copyTo, stringValue, displayName);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name" :error="error">
        <BentoDropdown
            :items="dropdownItems"
            :label="props.label"
            :placeholder="i18n.get('payByLink.inputs.select.placeholder')"
            :model-value="modelValue"
            dynamic-filtering
            :optional="!config.required && !props.hideOptionalLabel"
            :readonly="config.readOnly || props.loading"
            :error="!!error"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
