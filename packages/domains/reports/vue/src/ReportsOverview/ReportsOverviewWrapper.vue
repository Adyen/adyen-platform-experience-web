<script setup lang="ts">
import type { ReportsOverviewExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import ReportsOverviewContainer from './components/ReportsOverviewContainer.vue';

const props = defineProps<ReportsOverviewExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="reports" :refresh-component="refresh">
        <ReportsOverviewContainer
            :key="refreshCount"
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :on-filters-changed="props.onFiltersChanged"
            :data-customization="props.dataCustomization"
        />
    </UIElementProvider>
</template>
