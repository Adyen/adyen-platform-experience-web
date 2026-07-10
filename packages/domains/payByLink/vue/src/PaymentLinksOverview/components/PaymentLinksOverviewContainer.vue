<script setup lang="ts">
import PaymentLinksOverview from './PaymentLinksOverview.vue';
import { useStores } from '../composables/useStores';
import { usePaymentLinkFilterOptions } from '../composables/usePaymentLinkFilterOptions';
import type { PaymentLinksOverviewExternalProps } from '../types';

const props = withDefaults(
    defineProps<{
        allowLimitSelection?: boolean;
        balanceAccountId?: string;
        hideTitle?: boolean;
        preferredLimit?: 10 | 20;
        showDetails?: boolean;
        storeIds?: PaymentLinksOverviewExternalProps['storeIds'];
        onFiltersChanged?: PaymentLinksOverviewExternalProps['onFiltersChanged'];
        onRecordSelection?: PaymentLinksOverviewExternalProps['onRecordSelection'];
        onContactSupport?: () => void;
        paymentLinkCreation?: PaymentLinksOverviewExternalProps['paymentLinkCreation'];
        paymentLinkSettings?: PaymentLinksOverviewExternalProps['paymentLinkSettings'];
    }>(),
    {}
);

const { allStores, filteredStores, isFetching: isStoresLoading, error: storeError } = useStores(() => props.storeIds);
const { filters: filterOptions, error: filterOptionsError } = usePaymentLinkFilterOptions();
</script>

<template>
    <PaymentLinksOverview
        :allow-limit-selection="props.allowLimitSelection"
        :hide-title="props.hideTitle"
        :preferred-limit="props.preferredLimit"
        :show-details="props.showDetails"
        :store-ids="props.storeIds"
        :on-filters-changed="props.onFiltersChanged"
        :on-record-selection="props.onRecordSelection"
        :on-contact-support="props.onContactSupport"
        :payment-link-creation="props.paymentLinkCreation"
        :payment-link-settings="props.paymentLinkSettings"
        :stores="filteredStores"
        :all-stores="allStores"
        :is-stores-loading="isStoresLoading"
        :store-error="storeError"
        :filter-options="filterOptions"
        :filter-options-error="filterOptionsError"
    />
</template>
