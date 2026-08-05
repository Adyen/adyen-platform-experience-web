<script setup lang="ts">
import type { PayoutDetailsExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import PayoutDetailsContainer from './components/PayoutDetailsContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PayoutDetailsExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="payoutDetails" :refresh-component="refresh">
        <PayoutDetailsContainer
            :key="refreshCount"
            :id="props.id"
            :date="props.date"
            :data-customization="props.dataCustomization"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
        />
    </UIElementProvider>
</template>
