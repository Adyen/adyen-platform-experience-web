<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SelectField from '../../fields/SelectField.vue';
import { useWizard } from '../../../composables/wizardContext';
import type { IPaymentLinkSettings, IPaymentLinkStore } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';
import layoutStyles from '../FormLayout.module.scss';
import styles from './StoreForm.module.scss';

const props = defineProps<{
    selectItems: { id: string; name: string }[];
    settingsData?: IPaymentLinkSettings;
    storesData?: IPaymentLinkStore[];
    termsAndConditionsProvisioned: boolean;
    canModifySettings: boolean;
}>();

const emit = defineEmits<{
    setupTermsAndConditions: [];
}>();

const wizard = useWizard();
const { i18n } = wizard;

const selectedStoreId = computed(() => wizard.getValue('store'));
const showTcAlert = computed(() => !!props.settingsData && !!props.storesData && !!selectedStoreId.value && !props.termsAndConditionsProvisioned);
const alertDescriptionKey = computed<TranslationKey>(() =>
    props.canModifySettings
        ? 'payByLink.creation.storeForm.alerts.tcSetupRequired'
        : 'payByLink.creation.storeForm.alerts.tcSetupRequiredWithoutPermissions'
);

function handleSetupTermsAndConditions() {
    emit('setupTermsAndConditions');
}

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('payByLink.creation.storeForm.alerts.tcSetupRequiredAction'),
        event: handleSetupTermsAndConditions,
        variant: 'tertiary',
    },
]);
</script>

<template>
    <div :class="layoutStyles.fieldsContainer">
        <SelectField
            name="store"
            :label="i18n.get('payByLink.creation.fields.store.label')"
            :items="props.selectItems"
            :placeholder="i18n.get('common.inputs.select.placeholder')"
        />
        <BentoAlert v-if="showTcAlert" :class="styles.tcAlert" type="warning" role="alert">
            {{ i18n.get('payByLink.creation.storeForm.alerts.tcSetupRequiredTitle') }}
            <template #description>
                {{ i18n.get(alertDescriptionKey) }}
            </template>
            <template v-if="props.canModifySettings" #actions>
                <BentoButtonActions layout="buttons-start" :actions="actionButtons" />
            </template>
        </BentoAlert>
    </div>
</template>
