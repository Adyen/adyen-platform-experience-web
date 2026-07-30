<script setup lang="ts">
import { UIElementProvider } from '@integration-components/core/vue';
import TransactionDetailsContainer from './components/TransactionDetailsContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';
import type { TransactionDetailsExternalProps } from './types';

const props = defineProps<TransactionDetailsExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="transactionDetails">
        <TransactionDetailsContainer
            :id="props.id"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :hide-title="props.hideTitle"
        />
    </UIElementProvider>
</template>
