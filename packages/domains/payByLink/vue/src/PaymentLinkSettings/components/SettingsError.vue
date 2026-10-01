<script setup lang="ts">
import { computed } from 'vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { DomainTranslationKey } from '@integration-components/core/vue';
import { getSettingsErrorMessage } from '../utils/getSettingsErrorMessage';

const props = defineProps<{
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: DomainTranslationKey;
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
    <div v-if="errorInfo">
        <ErrorMessageDisplay :error-info="errorInfo" with-image :absolute-position="false" />
    </div>
</template>
