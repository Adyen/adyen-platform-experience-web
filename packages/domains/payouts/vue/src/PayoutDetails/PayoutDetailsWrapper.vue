<script setup lang="ts">
import type { PayoutDetailsExternalProps } from './types';
import { UIElementProvider } from '@integration-components/core/vue';
import PayoutDetailsContainer from './components/PayoutDetailsContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<PayoutDetailsExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="PayoutDetails">
        <PayoutDetailsContainer :id="props.id" :date="props.date" :data-customization="props.dataCustomization" />
    </UIElementProvider>
</template>
