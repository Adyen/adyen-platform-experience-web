<script setup lang="ts">
import { computed } from 'vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { V2TranslationKey } from '@integration-components/core/vue';
import { getSettingsErrorMessage } from '../utils/getSettingsErrorMessage';

const props = defineProps<{
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: V2TranslationKey;
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
        <ErrorMessageDisplay :error-info="errorInfo" :absolute-position="false" />
    </div>
</template>
