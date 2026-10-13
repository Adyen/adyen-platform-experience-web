<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import FieldWrapper from './FieldWrapper.vue';
import { useWizard } from '../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    items: { id: string; name: string; description?: string }[];
    filterable?: boolean;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
}>();

const wizard = useWizard();
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | undefined) ?? '');

const dropdownItems = computed(() => props.items.map(item => ({ label: item.name, description: item.description || undefined, value: item.id })));

watch(
    () => props.items,
    items => {
        if (config.value.visible && items.length === 1 && items[0] && !modelValue.value) {
            onUpdate(items[0].id);
        }
    },
    { immediate: true }
);

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | null | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    const stringValue = nextValue == null ? '' : String(nextValue);
    const displayName = props.items.find(item => item.id === stringValue)?.name ?? stringValue;
    wizard.setValue(props.name, stringValue, displayName);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name">
        <BentoDropdown
            :items="dropdownItems"
            :label="props.label"
            :placeholder="props.placeholder ?? props.label"
            :model-value="props.loading ? undefined : modelValue"
            :optional="!config.required"
            :clearable="!config.required"
            :readonly="config.readOnly"
            :disabled="props.disabled"
            :dynamic-filtering="props.filterable"
            :error-message="error"
            :loading="props.loading"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
