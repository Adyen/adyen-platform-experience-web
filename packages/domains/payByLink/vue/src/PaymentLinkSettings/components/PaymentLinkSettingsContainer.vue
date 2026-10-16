<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { providePaymentLinkSettings } from '../composables/context';
import { MENU_ITEMS } from '../constants';
import type { PaymentLinkSettingsComponentProps } from '../types';
import PaymentLinkSettings from './PaymentLinkSettings.vue';

type PaymentLinkSettingsContainerProps = PaymentLinkSettingsComponentProps & {
    navigateBack?: () => void;
};

const props = defineProps<PaymentLinkSettingsContainerProps>();

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
    <PaymentLinkSettings
        :hide-title="props.hideTitle"
        :on-contact-support="props.onContactSupport"
        :navigate-back="props.navigateBack"
        :on-dismiss="props.onDismiss"
    />
</template>
