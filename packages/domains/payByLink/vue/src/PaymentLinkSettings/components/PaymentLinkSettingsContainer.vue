<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { providePaymentLinkSettings } from '../composables/context';
import { MENU_ITEMS } from '../constants';
import type { PaymentLinkSettingsProps } from '../types';
import PaymentLinkSettings from './PaymentLinkSettings.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PaymentLinkSettingsProps>();

const { i18n } = useCoreContext();

const filteredMenuItems = computed(() =>
    props.settingsItems && props.settingsItems.length > 0 ? MENU_ITEMS.filter(item => props.settingsItems?.includes(item.value)) : MENU_ITEMS
);

const selectedMenuItems = computed(() => {
    const items = filteredMenuItems.value.length > 0 ? filteredMenuItems.value : MENU_ITEMS;
    return items.map(item => ({ ...item, label: i18n.get(item.label) }));
});

providePaymentLinkSettings({
    selectedMenuItems: selectedMenuItems.value,
    storeIds: props.storeIds,
    embeddedInOverview: props.embeddedInOverview,
    navigateBack: props.navigateBack,
});
</script>

<template>
    <PaymentLinkSettings :hide-title="props.hideTitle" :on-contact-support="props.onContactSupport" :navigate-back="props.navigateBack" />
</template>
