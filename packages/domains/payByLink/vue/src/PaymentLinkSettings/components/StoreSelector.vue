<script setup lang="ts">
import type { StoreItem } from '../types';
import StoreDropdown from '../../shared/components/StoreDropdown.vue';
import styles from './StoreSelector.module.scss';

const props = defineProps<{
    stores?: StoreItem[];
    selectedStoreId?: string;
}>();

const emit = defineEmits<{
    'update:selectedStoreId': [value: string];
}>();

function onUpdate(value: string) {
    if (value !== '') {
        emit('update:selectedStoreId', value);
    }
}
</script>

<template>
    <StoreDropdown
        v-if="stores && stores.length > 1"
        :class="styles.root"
        :stores="props.stores"
        :model-value="props.selectedStoreId ?? ''"
        @update:model-value="onUpdate"
    />
</template>
