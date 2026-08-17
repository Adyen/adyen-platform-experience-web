<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import type { StoreItem } from '../types';

const props = defineProps<{
    stores?: StoreItem[];
    selectedStoreId?: string;
}>();

const emit = defineEmits<{
    'update:selectedStoreId': [value: string];
}>();

const dropdownItems = computed(() =>
    (props.stores ?? []).map(store => ({ label: store.storeCode || store.name, description: store.description || undefined, value: store.id }))
);

function onUpdate(value: string | number | { value?: string | number } | Array<string | number | { value?: string | number }> | undefined) {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' ? value?.value : value;
    if (nextValue !== undefined && nextValue !== '') emit('update:selectedStoreId', String(nextValue));
}
</script>

<template>
    <BentoDropdown
        v-if="stores && stores.length > 1"
        class="adyen-pe-payment-link-settings__store-selector"
        :items="dropdownItems"
        :model-value="selectedStoreId ?? ''"
        @update:model-value="onUpdate"
    />
</template>
