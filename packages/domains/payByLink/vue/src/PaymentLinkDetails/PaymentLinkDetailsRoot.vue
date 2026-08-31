<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import { usePayByLinkContext } from '../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../integration/translationKeys';
import type { PaymentLinkDetailsDomainProps } from '../integration/types';
import PaymentLinkDetails from './components/PaymentLinkDetails/PaymentLinkDetails.vue';

const props = defineProps<PaymentLinkDetailsDomainProps>();

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
    <PaymentLinkDetails
        v-else-if="runtime.available === true"
        :id="props.id"
        :hide-title="props.hideTitle"
        :on-contact-support="props.onContactSupport"
        :on-dismiss="props.onDismiss"
        :on-update="props.onUpdate"
    />
</template>
