<script setup lang="ts">
// TODO: Replace BentoList with BentoSecondaryNav once it supports a non-dropdown mobile presentation.
import { BentoList, BentoListItem } from '@adyen/bento-vue3';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { MenuItemType, PaymentLinkSettingsItem } from '../types';
import styles from './SecondaryNav.module.scss';

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
    <nav :class="styles.root" :aria-label="i18n.get('payByLink.settings.title')">
        <BentoList :class="styles.list">
            <BentoListItem
                v-for="item in items"
                :key="item.value"
                :label="item.label"
                with-chevron
                :class="[styles.item, { [styles.itemActive]: item.value === activeValue, [styles.mobile]: isMobile, [styles.desktop]: !isMobile }]"
                :aria-current="item.value === activeValue ? 'true' : undefined"
                @click="emit('select', item.value)"
            />
        </BentoList>
    </nav>
</template>
