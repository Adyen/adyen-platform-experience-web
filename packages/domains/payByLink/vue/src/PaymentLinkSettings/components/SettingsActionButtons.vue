<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { useSettingsPermission } from '../composables/useSettingsPermission';
import { MenuItem } from '../constants';
import styles from './SettingsActionButtons.module.scss';

const props = defineProps<{
    navigateBack?: () => void;
    closeContent?: () => void;
}>();

const { i18n } = useCoreContext();
const { activeMenuItem, onSave, isSaving, isLoadingContent, isLoadingStores, isSaveSuccess } = usePaymentLinkSettingsContext();
const { themeEnabled, termsAndConditionsEnabled } = useSettingsPermission();

const isLoading = computed(() => isLoadingContent.value || isLoadingStores.value);

const isSaveDisabled = computed(() => {
    if (!activeMenuItem.value) return false;
    const isActiveMenuItemEnabled = activeMenuItem.value === MenuItem.theme ? themeEnabled.value : termsAndConditionsEnabled.value;
    return !isActiveMenuItemEnabled || !!(isSaving.value || isLoading.value || (props.navigateBack && isSaveSuccess.value));
});

const actionButtons = computed<BentoButtonActionsList>(() => {
    const buttons: BentoButtonActionsList = [
        {
            title: i18n.get('payByLink.settings.common.action.save'),
            disabled: isSaveDisabled.value,
            event: onSave,
            state: isSaving.value && !(props.navigateBack && isSaveSuccess.value) ? 'loading' : 'start',
        },
    ];
    if (props.navigateBack || props.closeContent) {
        buttons.push({
            title: i18n.get('payByLink.common.actions.goBack'),
            disabled: isLoading.value,
            event: props.navigateBack ?? props.closeContent,
            variant: 'secondary',
        });
    }
    return buttons;
});
</script>

<template>
    <div :class="styles.root">
        <BentoButtonActions layout="buttons-end" :actions="actionButtons" />
    </div>
</template>
