<script setup lang="ts">
import type { PaymentLinksOverviewExternalProps } from './types';
import { createRefreshContext, UIElementProvider } from '@integration-components/core/vue';
import PaymentLinksOverviewContainer from './components/PaymentLinksOverviewContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = withDefaults(defineProps<PaymentLinksOverviewExternalProps>(), {
    showDetails: true,
});
const { refresh, refreshCount } = createRefreshContext();
</script>

<template>
    <UIElementProvider :core="props.core" component-name="paymentLinksOverview" :refresh-component="refresh">
        <PaymentLinksOverviewContainer
            :key="refreshCount"
            :allow-limit-selection="props.allowLimitSelection"
            :balance-account-id="props.balanceAccountId"
            :hide-title="props.hideTitle"
            :preferred-limit="props.preferredLimit"
            :show-details="props.showDetails"
            :store-ids="props.storeIds"
            :on-filters-changed="props.onFiltersChanged"
            :on-record-selection="props.onRecordSelection"
            :on-contact-support="props.onContactSupport"
            :payment-link-creation="props.paymentLinkCreation"
            :payment-link-settings="props.paymentLinkSettings"
        />
    </UIElementProvider>
</template>
