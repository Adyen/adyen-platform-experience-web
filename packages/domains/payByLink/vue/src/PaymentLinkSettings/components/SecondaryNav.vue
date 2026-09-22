<script setup lang="ts">
// TODO: Replace BentoList with BentoSecondaryNav once it supports a non-dropdown mobile presentation.
import { BentoList, BentoListItem, BentoTypography } from '@adyen/bento-vue3';
import ChevronRightIcon from '@adyen/ui-assets-icons-16/vue/chevron-right-small';
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
            <BentoListItem v-for="item in items" :key="item.value" :class="styles.item">
                <template #content>
                    <button
                        type="button"
                        :class="[styles.button, { [styles.buttonActive]: item.value === activeValue, [styles.buttonMobile]: isMobile }]"
                        :aria-current="item.value === activeValue ? 'true' : undefined"
                        @click="emit('select', item.value)"
                    >
                        <BentoTypography variant="body" el="span">{{ item.label }}</BentoTypography>
                        <ChevronRightIcon v-if="isMobile" :class="styles.chevron" data-testid="secondary-nav-chevron" aria-hidden="true" />
                    </button>
                </template>
            </BentoListItem>
        </BentoList>
    </nav>
</template>
