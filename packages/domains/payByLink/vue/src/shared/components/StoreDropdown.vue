<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import { getStoreDropdownDisplayValue } from '../utils/storeDropdown';

export interface StoreOption {
    id: string;
    name?: string;
    storeCode?: string;
    description?: string;
}

const props = withDefaults(
    defineProps<{
        items?: StoreOption[];
        stores?: StoreOption[];
        modelValue?: string;
        label?: string;
        placeholder?: string;
        disabled?: boolean;
        readonly?: boolean;
        optional?: boolean;
        dynamicFiltering?: boolean;
        errorMessage?: string;
    }>(),
    {
        items: undefined,
        stores: undefined,
        modelValue: '',
        label: undefined,
        placeholder: undefined,
        disabled: false,
        readonly: false,
        optional: false,
        dynamicFiltering: false,
        errorMessage: undefined,
    }
);

const emit = defineEmits<{
    'update:modelValue': [value: string, selectedStore?: StoreOption];
    change: [value: string, selectedStore?: StoreOption];
}>();

const storeList = computed(() => props.items ?? props.stores ?? []);

const dropdownItems = computed(() =>
    storeList.value.map(store => ({
        label: store.storeCode || store.name || '',
        description: store.description || undefined,
        value: store.id,
    }))
);

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    if (nextValue === undefined) return;
    const stringValue = String(nextValue);
    const selectedStore = storeList.value.find(item => item.id === stringValue);
    emit('update:modelValue', stringValue, selectedStore);
    emit('change', stringValue, selectedStore);
}
</script>

<template>
    <BentoDropdown
        :items="dropdownItems"
        :label="props.label"
        :placeholder="props.placeholder ?? props.label"
        :model-value="props.modelValue"
        :optional="props.optional"
        :readonly="props.readonly"
        :disabled="props.disabled"
        :dynamic-filtering="props.dynamicFiltering"
        :error-message="props.errorMessage"
        @update:model-value="onUpdate"
    >
        <template #display-value="{ label: itemLabel, description }">
            <span v-text="getStoreDropdownDisplayValue(itemLabel, description)" />
        </template>
    </BentoDropdown>
</template>
