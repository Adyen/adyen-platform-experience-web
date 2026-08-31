<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import { getSettingsErrorMessage } from '../utils/getSettingsErrorMessage';
import { usePayByLinkContext } from '../../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../../integration/translationKeys';

const props = defineProps<{
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: PayByLinkTranslationKey;
    onContactSupport?: () => void;
}>();
const { i18n, runtime } = usePayByLinkContext();

const content = computed(() => getSettingsErrorMessage(props.error, props.errorMessage, props.onContactSupport));

const errorInfo = computed(() =>
    content.value
        ? {
              ...content.value,
              requestId: props.error?.requestId,
              onContactSupport: props.onContactSupport,
          }
        : undefined
);
const { presentation } = useDataOverviewError({
    actionKeys: PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS,
    errorInfo: computed(() => errorInfo.value ?? { messages: [] }),
    onRefresh: () => runtime.refresh(),
    translate: (key, options) => i18n.get(key, options),
});
</script>

<template>
    <DataOverviewError v-if="errorInfo" v-bind="presentation" />
</template>
