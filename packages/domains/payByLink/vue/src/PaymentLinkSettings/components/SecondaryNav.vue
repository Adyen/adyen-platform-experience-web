<script setup lang="ts">
import { BentoTypography } from '@adyen/bento-vue3';
import type { MenuItemType, PaymentLinkSettingsItem } from '../types';

defineProps<{
    items: MenuItemType[];
    activeValue: PaymentLinkSettingsItem | null;
}>();

const emit = defineEmits<{
    select: [value: PaymentLinkSettingsItem];
}>();
</script>

<template>
    <nav class="adyen-pe-payment-link-settings__secondary-nav">
        <ul class="adyen-pe-payment-link-settings__secondary-nav-list">
            <li v-for="item in items" :key="item.value">
                <button
                    type="button"
                    class="adyen-pe-payment-link-settings__secondary-nav-item"
                    :class="{ 'adyen-pe-payment-link-settings__secondary-nav-item--active': item.value === activeValue }"
                    :aria-current="item.value === activeValue ? 'true' : undefined"
                    @click="emit('select', item.value)"
                >
                    <BentoTypography variant="body" el="span">{{ item.label }}</BentoTypography>
                </button>
            </li>
        </ul>
    </nav>
</template>
