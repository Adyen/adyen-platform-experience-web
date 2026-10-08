<script setup lang="ts">
import PaymentLinksOverview from './PaymentLinksOverview.vue';
import { useStores } from '../composables/useStores';
import { usePaymentLinkFilterOptions } from '../composables/usePaymentLinkFilterOptions';
import type { PaymentLinksOverviewExternalProps } from '../types';

const props = withDefaults(
    defineProps<{
        allowLimitSelection?: boolean;
        balanceAccountId?: string;
        preferredLimit?: PaymentLinksOverviewExternalProps['preferredLimit'];
        storeIds?: PaymentLinksOverviewExternalProps['storeIds'];
        onRecordSelection?: PaymentLinksOverviewExternalProps['onRecordSelection'];
        onContactSupport?: () => void;
        paymentLinkCreation?: PaymentLinksOverviewExternalProps['paymentLinkCreation'];
        paymentLinkSettings?: PaymentLinksOverviewExternalProps['paymentLinkSettings'];
    }>(),
    {}
);

const { allStores, filteredStores, isFetching: isStoresLoading, error: storeError } = useStores(() => props.storeIds);
const { filters: filterOptions, isFetching: isFilterOptionsLoading, error: filterOptionsError } = usePaymentLinkFilterOptions();
</script>

<template>
    <PaymentLinksOverview
        :allow-limit-selection="props.allowLimitSelection"
        :preferred-limit="props.preferredLimit"
        :store-ids="props.storeIds"
        :on-record-selection="props.onRecordSelection"
        :on-contact-support="props.onContactSupport"
        :payment-link-creation="props.paymentLinkCreation"
        :payment-link-settings="props.paymentLinkSettings"
        :stores="filteredStores"
        :all-stores="allStores"
        :is-filters-loading="isStoresLoading || isFilterOptionsLoading"
        :store-error="storeError"
        :filter-options="filterOptions"
        :filter-options-error="filterOptionsError"
    />
</template>
