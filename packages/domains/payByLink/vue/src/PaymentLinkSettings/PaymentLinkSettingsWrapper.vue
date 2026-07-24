<script setup lang="ts">
import type { PaymentLinkSettingsExternalProps } from './types';
import { UIElementProvider } from '@integration-components/core/vue';
import PaymentLinkSettingsContainer from './components/PaymentLinkSettingsContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PaymentLinkSettingsExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinkSettings">
        <PaymentLinkSettingsContainer
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :store-ids="props.storeIds"
            :settings-items="props.settingsItems"
            :embedded-in-overview="props.embeddedInOverview"
            :navigate-back="props.navigateBack"
        />
    </UIElementProvider>
</template>
