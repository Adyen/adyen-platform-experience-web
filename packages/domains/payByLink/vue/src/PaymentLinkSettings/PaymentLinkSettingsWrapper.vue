<script setup lang="ts">
import type { PaymentLinkSettingsExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import PaymentLinkSettingsContainer from './components/PaymentLinkSettingsContainer.vue';

const props = defineProps<PaymentLinkSettingsExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinkSettings" :refresh-component="refresh">
        <PaymentLinkSettingsContainer
            :key="refreshCount"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :store-ids="props.storeIds"
            :settings-items="props.settingsItems"
            :embedded-in-overview="props.embeddedInOverview"
            :navigate-back="props.navigateBack"
        />
    </UIElementProvider>
</template>
