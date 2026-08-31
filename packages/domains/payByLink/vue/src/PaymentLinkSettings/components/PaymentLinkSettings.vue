<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoDivider, BentoTypography } from '@adyen/bento-vue3';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import { usePayByLinkContext } from '../../integration/context';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { ACCOUNT_MISCONFIGURATION, WRONG_STORE_IDS } from '../constants';
import type { PaymentLinkSettingsItem } from '../types';
import SettingsError from './SettingsError.vue';
import StoreSelector from './StoreSelector.vue';
import SecondaryNav from './SecondaryNav.vue';
import PaymentLinkSettingsContent from './PaymentLinkSettingsContent.vue';
import SettingsActionButtons from './SettingsActionButtons.vue';
import styles from './PaymentLinkSettings.module.scss';

const ERROR_MESSAGE_KEY: PayByLinkTranslationKey = 'payByLink.settings.errors.couldNotLoadSettings';

const props = defineProps<{
    hideTitle?: boolean;
    onContactSupport?: () => void;
    navigateBack?: () => void;
}>();

const { i18n } = usePayByLinkContext();
const {
    activeMenuItem,
    setSelectedMenuItem,
    selectedStore,
    isLoadingStores,
    isShowingRequirements,
    storesError,
    setSelectedStore,
    filteredStores,
    menuItems,
    isLoadingContent,
    allStores,
    themeError,
    termsAndConditionsError,
} = usePaymentLinkSettingsContext();

const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
const contentVisible = ref(!isSmContainer.value || menuItems.value.length === 1);

watch(isSmContainer, value => {
    contentVisible.value = !value || menuItems.value.length === 1;
});

function onSelectMenuItem(value: PaymentLinkSettingsItem) {
    setSelectedMenuItem(value);
    if (isSmContainer.value) contentVisible.value = true;
}

function closeContent() {
    if (!isSmContainer.value) return;
    contentVisible.value = false;
}

const noStoresError = computed<AdyenPlatformExperienceError | undefined>(() => {
    if (!allStores.value || allStores.value.length > 0 || isLoadingStores.value) return undefined;
    return { errorCode: ACCOUNT_MISCONFIGURATION, type: 'error', requestId: '' } as AdyenPlatformExperienceError;
});

const storesFilteredError = computed<AdyenPlatformExperienceError | undefined>(() => {
    if (!allStores.value || isLoadingStores.value) return undefined;
    if (allStores.value.length > 0 && filteredStores.value?.length !== 0) return undefined;
    return { errorCode: WRONG_STORE_IDS, type: 'error', requestId: '' } as AdyenPlatformExperienceError;
});

const error = computed(() => storesError.value ?? noStoresError.value ?? storesFilteredError.value);
const hasError = computed(() => !!noStoresError.value || !!storesError.value || !!storesFilteredError.value);

const showActionButtons = computed(
    () => contentVisible.value && !themeError.value && !storesError.value && !termsAndConditionsError.value && !isShowingRequirements.value
);
</script>

<template>
    <div v-if="menuItems.length > 0" :class="styles.root">
        <BentoTypography v-if="!props.hideTitle && (!isSmContainer || !contentVisible)" variant="title" el="h1">
            {{ i18n.get('payByLink.settings.title') }}
        </BentoTypography>
        <SettingsError v-if="hasError" :error="error" :error-message="ERROR_MESSAGE_KEY" :on-contact-support="props.onContactSupport" />
        <template v-else>
            <div :class="[styles.contentContainer, { [styles.contentContainerMobile]: isSmContainer && contentVisible }]">
                <template v-if="menuItems.length > 1">
                    <div v-if="!contentVisible || !isSmContainer" :class="styles.sidebarContainer">
                        <StoreSelector :stores="filteredStores" :selected-store-id="selectedStore" @update:selected-store-id="setSelectedStore" />
                        <SecondaryNav :items="menuItems" :active-value="activeMenuItem" @select="onSelectMenuItem" />
                    </div>
                    <div v-if="!isSmContainer" :class="styles.dividerContainer">
                        <BentoDivider variant="vertical" />
                    </div>
                    <PaymentLinkSettingsContent
                        v-if="contentVisible && activeMenuItem"
                        :active-menu-item="activeMenuItem"
                        :is-loading-content="isLoadingContent"
                    />
                </template>
                <PaymentLinkSettingsContent v-else :active-menu-item="activeMenuItem" :is-loading-content="isLoadingContent" />
            </div>
            <SettingsActionButtons
                v-if="showActionButtons"
                :navigate-back="props.navigateBack"
                :close-content="isSmContainer ? closeContent : undefined"
            />
        </template>
    </div>
</template>
