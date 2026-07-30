<script setup lang="ts">
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import TransactionDetailsContainer from './components/TransactionDetailsContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';
import type { TransactionDetailsExternalProps } from './types';

const props = defineProps<TransactionDetailsExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="transactionDetails" :refresh-component="refresh">
        <TransactionDetailsContainer
            :key="refreshCount"
            :id="props.id"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :hide-title="props.hideTitle"
        />
    </UIElementProvider>
</template>
