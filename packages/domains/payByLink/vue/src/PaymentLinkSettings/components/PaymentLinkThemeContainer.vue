<script setup lang="ts">
import { computed } from 'vue';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { isThemeData } from '@integration-components/payByLink/domain';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SettingsError from './SettingsError.vue';
import ThemeForm from './ThemeForm.vue';
import type { ThemeFormData } from '../types';
import styles from './PaymentLinkThemeContainer.module.scss';

const ERROR_MESSAGE_KEY: PayByLinkTranslationKey = 'payByLink.settings.theme.errors.couldNotLoad';

const { savedData: theme, themeError, isLoadingContent } = usePaymentLinkSettingsContext();

const data = computed<ThemeFormData>(() => {
    if (!isLoadingContent.value && !themeError.value && theme.value && typeof theme.value === 'object' && Object.keys(theme.value).length > 0) {
        return theme.value as ThemeFormData;
    }
    return { brandName: '' };
});
</script>

<template>
    <section v-if="themeError" :class="styles.root">
        <SettingsError :error="themeError" :error-message="ERROR_MESSAGE_KEY" />
    </section>
    <LoadingSkeleton v-else-if="!theme || !isThemeData(data)" :row-number="3" />
    <section v-else :class="styles.root">
        <ThemeForm :theme="data" />
    </section>
</template>
