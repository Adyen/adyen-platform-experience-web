<script setup lang="ts">
import type { PayoutsOverviewExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import PayoutsOverviewContainer from './components/PayoutsOverviewContainer.vue';

const props = defineProps<PayoutsOverviewExternalProps>();
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="payouts" :refresh-component="refresh">
        <PayoutsOverviewContainer
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
