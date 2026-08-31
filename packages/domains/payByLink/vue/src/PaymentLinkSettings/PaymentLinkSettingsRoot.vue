<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import { usePayByLinkContext } from '../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../integration/translationKeys';
import type { PaymentLinkSettingsDomainProps } from '../integration/types';
import PaymentLinkSettingsContainer from './components/PaymentLinkSettingsContainer.vue';

const props = defineProps<PaymentLinkSettingsDomainProps>();

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
    <PaymentLinkSettingsContainer
        v-else-if="runtime.available === true"
        :hide-title="props.hideTitle"
        :on-contact-support="props.onContactSupport"
        :store-ids="props.storeIds"
        :settings-items="props.settingsItems"
        :embedded-in-overview="props.embeddedInOverview"
        :navigate-back="props.navigateBack"
    />
</template>
