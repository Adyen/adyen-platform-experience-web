<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import FieldWrapper from './FieldWrapper.vue';
import { useWizard } from '../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    items: { id: string; name: string }[];
    filterable?: boolean;
    placeholder?: string;
    disabled?: boolean;
}>();

const wizard = useWizard();
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | undefined) ?? '');

const dropdownItems = computed(() => props.items.map(item => ({ label: item.name, value: item.id })));

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    if (nextValue === undefined) return;
    const stringValue = String(nextValue);
    const displayName = props.items.find(item => item.id === stringValue)?.name ?? stringValue;
    wizard.setValue(props.name, stringValue, displayName);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name" :error="error">
        <BentoDropdown
            :items="dropdownItems"
            :label="props.label"
            :placeholder="props.placeholder ?? props.label"
            :model-value="modelValue"
            :optional="!config.required"
            :readonly="config.readOnly"
            :disabled="props.disabled"
            :dynamic-filtering="props.filterable"
            :error="!!error"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
