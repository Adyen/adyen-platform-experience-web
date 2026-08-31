<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import { usePayByLinkContext } from '../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../integration/translationKeys';
import type { PaymentLinkCreationDomainProps } from '../integration/types';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';

const props = defineProps<PaymentLinkCreationDomainProps>();

const { i18n, runtime } = usePayByLinkContext();
const unavailableErrorInfo = computed(() =>
    runtime.available === false
        ? {
              title: 'payByLink.errors.somethingWentWrong',
              messages: ['payByLink.errors.componentUnavailable', 'payByLink.errors.contactSupport'],
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
    <PaymentLinkCreationContainer
        v-else-if="runtime.available === true"
        :fields-config="props.fieldsConfig"
        :store-ids="props.storeIds"
        :hide-title="props.hideTitle"
        :on-creation-dismiss="props.onCreationDismiss"
        :on-contact-support="props.onContactSupport"
        :on-payment-link-created="props.onPaymentLinkCreated"
        :on-show-details="props.onShowDetails"
    />
</template>
