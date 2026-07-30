<script setup lang="ts">
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import DisputesOverviewContainer from './components/DisputesOverviewContainer.vue';
import type { DisputesOverviewExternalProps } from './types';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<DisputesOverviewExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="disputes" :refresh-component="refresh">
        <DisputesOverviewContainer
            :key="refreshCount"
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :hide-title="props.hideTitle"
            :show-details="props.showDetails"
            :on-contact-support="props.onContactSupport"
            :on-filters-changed="props.onFiltersChanged"
            :on-record-selection="props.onRecordSelection"
            :data-customization="props.dataCustomization"
        />
    </UIElementProvider>
</template>
