<script setup lang="ts">
import { computed } from 'vue';
import { ComponentShell } from '@integration-components/composables-vue';
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
    <ComponentShell v-if="errorInfo" state="error" :error-info="errorInfo" />
</template>
