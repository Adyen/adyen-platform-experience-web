<script setup lang="ts">
import { BentoTypography } from '@adyen/bento-vue3';
import type { MenuItemType, PaymentLinkSettingsItem } from '../types';
import styles from './SecondaryNav.module.scss';

defineProps<{
    items: MenuItemType[];
    activeValue: PaymentLinkSettingsItem | null;
}>();

const emit = defineEmits<{
    select: [value: PaymentLinkSettingsItem];
}>();
</script>

<template>
    <nav :class="styles.root">
        <ul :class="styles.list">
            <li v-for="item in items" :key="item.value">
                <button
                    type="button"
                    :class="[styles.item, { [styles.itemActive]: item.value === activeValue }]"
                    :aria-current="item.value === activeValue ? 'true' : undefined"
                    @click="emit('select', item.value)"
                >
                    <BentoTypography variant="body" el="span">{{ item.label }}</BentoTypography>
                </button>
            </li>
        </ul>
    </nav>
</template>
