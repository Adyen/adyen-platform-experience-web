<script setup lang="ts">
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import DisputeDetailsContainer from './components/DisputeDetailsContainer.vue';
import type { DisputeManagementExternalProps } from './types';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<DisputeManagementExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="disputesManagement" :refresh-component="refresh">
        <DisputeDetailsContainer
            :key="refreshCount"
            :id="props.id"
            :hide-title="props.hideTitle"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-dispute-accept="props.onDisputeAccept"
            :on-dispute-defend="props.onDisputeDefend"
            :on-dismiss="props.onDismiss"
        />
    </UIElementProvider>
</template>
