<script setup lang="ts">
import type { CapitalOverviewExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import CapitalOverviewContainer from './components/CapitalOverviewContainer/CapitalOverviewContainer.vue';

const props = defineProps<CapitalOverviewExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="capitalOverview" :refresh-component="refresh">
        <CapitalOverviewContainer
            :key="refreshCount"
            :hide-title="props.hideTitle"
            :on-funds-request="props.onFundsRequest"
            :on-offer-dismiss="props.onOfferDismiss"
            :on-offer-options-request="props.onOfferOptionsRequest"
            :skip-pre-qualified-intro="props.skipPreQualifiedIntro"
            :on-contact-support="props.onContactSupport"
        />
    </UIElementProvider>
</template>
