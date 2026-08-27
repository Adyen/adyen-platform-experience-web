<script setup lang="ts">
import { computed } from 'vue';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useSettingsPermission } from '../composables/useSettingsPermission';
import { MenuItem, PERMISSION_ERROR } from '../constants';
import type { PaymentLinkSettingsItem } from '../types';
import PaymentLinkThemeContainer from './PaymentLinkThemeContainer.vue';
import TermsAndConditionsContainer from './TermsAndConditionsContainer.vue';
import SettingsError from './SettingsError.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import layoutStyles from './PaymentLinkSettingsLayout.module.scss';

const THEME_ERROR_MESSAGE_KEY = 'payByLink.settings.theme.errors.couldNotLoad';
const TERMS_AND_CONDITIONS_ERROR_MESSAGE_KEY = 'payByLink.settings.termsAndConditions.errors.couldNotLoad';

defineProps<{
    activeMenuItem: PaymentLinkSettingsItem | null;
    isLoadingContent: boolean;
}>();

const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
const { themeEnabled, termsAndConditionsEnabled } = useSettingsPermission();

const permissionError = computed<AdyenPlatformExperienceError | undefined>(() => {
    if (themeEnabled.value && termsAndConditionsEnabled.value) return undefined;
    return { errorCode: PERMISSION_ERROR, type: 'error', requestId: '' } as AdyenPlatformExperienceError;
});
</script>

<template>
    <div :class="isSmContainer ? layoutStyles.contentItemMobile : layoutStyles.contentItem">
        <LoadingSkeleton v-if="isLoadingContent" :row-number="activeMenuItem === MenuItem.termsAndConditions ? 2 : 3" />
        <template v-else-if="activeMenuItem === MenuItem.theme">
            <SettingsError v-if="!themeEnabled" :error="permissionError" :error-message="THEME_ERROR_MESSAGE_KEY" />
            <PaymentLinkThemeContainer v-else />
        </template>
        <template v-else-if="activeMenuItem === MenuItem.termsAndConditions">
            <SettingsError v-if="!termsAndConditionsEnabled" :error="permissionError" :error-message="TERMS_AND_CONDITIONS_ERROR_MESSAGE_KEY" />
            <TermsAndConditionsContainer v-else />
        </template>
    </div>
</template>
