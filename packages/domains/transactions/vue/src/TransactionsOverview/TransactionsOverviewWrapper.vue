<script setup lang="ts">
import { UIElementProvider } from '@integration-components/core/vue';
import TransactionsOverviewContainer from './components/TransactionsOverviewContainer/TransactionsOverviewContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';
import type { TransactionsOverviewExternalProps } from './types';

const props = defineProps<TransactionsOverviewExternalProps>();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="transactions">
        <TransactionsOverviewContainer
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
