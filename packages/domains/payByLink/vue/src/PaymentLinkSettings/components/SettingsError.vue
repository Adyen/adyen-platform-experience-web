<script setup lang="ts">
import { computed } from 'vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { getSettingsErrorMessage } from '../utils/getSettingsErrorMessage';

const props = defineProps<{
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
    onContactSupport?: () => void;
}>();

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
</script>

<template>
    <div v-if="errorInfo" class="adyen-pe-payment-link-settings__error">
        <ErrorMessageDisplay :error-info="errorInfo" :absolute-position="false" />
    </div>
</template>
