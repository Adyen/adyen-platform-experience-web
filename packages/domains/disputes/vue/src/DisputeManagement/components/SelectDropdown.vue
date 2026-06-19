<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import type { SelectDropdownItem } from '../types';

const props = defineProps<{
    items: SelectDropdownItem[];
    modelValue?: string | null;
    placeholder: string;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const dropdownItems = computed(() =>
    props.items.map(item => ({
        label: item.name,
        value: item.id,
        data: { disabled: item.disabled === true },
    }))
);

function isOptionDisabled(option: { data?: unknown }) {
    return !!option.data && typeof option.data === 'object' && 'disabled' in option.data && option.data.disabled === true;
}

function onUpdate(value: string | number | { value?: string | number } | Array<string | number | { value?: string | number }> | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' ? value?.value : value;
    if (nextValue !== undefined && nextValue !== '') emit('update:modelValue', String(nextValue));
}
</script>

<template>
    <BentoDropdown
        class="adyen-pe-dispute-select"
        :disabled="props.disabled"
        :is-option-disabled="isOptionDisabled"
        :items="dropdownItems"
        :label="props.placeholder"
        :model-value="props.modelValue ?? ''"
        :placeholder="props.placeholder"
        @update:model-value="onUpdate"
    />
</template>
