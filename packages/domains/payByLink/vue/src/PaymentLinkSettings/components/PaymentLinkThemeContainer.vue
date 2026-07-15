<script setup lang="ts">
import { computed } from 'vue';
import type { TranslationKey } from '@integration-components/core';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { isThemeData } from '../utils/typeGuards';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SettingsError from './SettingsError.vue';
import ThemeForm from './ThemeForm.vue';
import type { ThemeFormData } from '../types';

const ERROR_MESSAGE_KEY: TranslationKey = 'payByLink.settings.theme.errors.couldNotLoad';

const { savedData: theme, themeError, isLoadingContent } = usePaymentLinkSettingsContext();

const data = computed<ThemeFormData>(() => {
    if (!isLoadingContent.value && !themeError.value && theme.value && typeof theme.value === 'object' && Object.keys(theme.value).length > 0) {
        return theme.value as ThemeFormData;
    }
    return { brandName: '' };
});
</script>

<template>
    <section v-if="themeError" class="adyen-pe-payment-link-theme">
        <SettingsError :error="themeError" :error-message="ERROR_MESSAGE_KEY" />
    </section>
    <LoadingSkeleton v-else-if="!theme || !isThemeData(data)" :row-number="3" />
    <section v-else class="adyen-pe-payment-link-theme">
        <ThemeForm :theme="data" />
    </section>
</template>
