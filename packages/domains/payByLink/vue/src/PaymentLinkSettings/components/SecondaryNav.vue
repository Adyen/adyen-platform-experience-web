<script setup lang="ts">
// TODO: Replace BentoList with BentoSecondaryNav once it supports a non-dropdown mobile presentation.
import { BentoList, BentoListItem } from '@adyen/bento-vue3';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { MenuItemType, PaymentLinkSettingsItem } from '../types';
import '../styles/secondaryNav.scss';

defineProps<{
    items: MenuItemType[];
    activeValue: PaymentLinkSettingsItem | null;
}>();

const emit = defineEmits<{
    select: [value: PaymentLinkSettingsItem];
}>();

const { i18n } = useCoreContext();
const isMobile = useResponsiveContainer(containerQueries.down.xs);
</script>

<template>
    <nav class="adyen-pe-payment-link-settings__secondary-nav" :aria-label="i18n.get('payByLink.settings.title')">
        <BentoList>
            <BentoListItem
                v-for="item in items"
                :key="item.value"
                :label="item.label"
                with-chevron
                :class="{
                    'adyen-pe-payment-link-settings__secondary-nav-item--active': item.value === activeValue,
                    'adyen-pe-payment-link-settings__secondary-nav-item--desktop': !isMobile,
                    'adyen-pe-payment-link-settings__secondary-nav-item--mobile': isMobile,
                }"
                :aria-current="item.value === activeValue ? 'true' : undefined"
                @click="emit('select', item.value)"
            />
        </BentoList>
    </nav>
</template>
