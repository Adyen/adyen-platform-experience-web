<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import { usePayByLinkContext } from '../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../integration/translationKeys';
import type { PaymentLinksOverviewDomainProps } from '../integration/types';
import PaymentLinksOverviewContainer from './components/PaymentLinksOverviewContainer.vue';

// Vue casts an absent Boolean prop to `false`, which would defeat the container-level
// default. Preact treats `showDetails` as `true` unless explicitly disabled, so the root
// declares that default here to keep the absent/false distinction intact.
const props = withDefaults(defineProps<PaymentLinksOverviewDomainProps>(), { showDetails: true });

const { i18n, runtime } = usePayByLinkContext();
const unavailableErrorInfo = computed(() =>
    runtime.available === false
        ? {
              title: 'payByLink.errors.somethingWentWrong',
              messages: ['payByLink.overview.errors.unavailable', 'payByLink.errors.contactSupport'],
          }
        : { messages: [] }
);
const { presentation: unavailableErrorPresentation } = useDataOverviewError({
    actionKeys: PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS,
    errorInfo: unavailableErrorInfo,
    translate: (key, options) => i18n.get(key, options),
});
</script>

<template>
    <DataOverviewError v-if="runtime.available === false" v-bind="unavailableErrorPresentation" />
    <PaymentLinksOverviewContainer
        v-else-if="runtime.available === true"
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
</template>
