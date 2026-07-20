<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import SelectField from '../../fields/SelectField.vue';
import { useWizard } from '../../../composables/wizardContext';
import { PAYMENT_LINK_CREATION_CLASS_NAMES } from '../../../../../../domain/src';
import type { IPaymentLinkSettings, IPaymentLinkStore } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';
import './StoreForm.scss';

const props = defineProps<{
    selectItems: { id: string; name: string }[];
    settingsData?: IPaymentLinkSettings;
    storesData?: IPaymentLinkStore[];
    termsAndConditionsProvisioned: boolean;
    canModifySettings: boolean;
}>();

const wizard = useWizard();
const { i18n } = wizard;
const CLASS_NAMES = PAYMENT_LINK_CREATION_CLASS_NAMES;

const selectedStoreId = computed(() => wizard.getValue('store'));
const showTcAlert = computed(() => !!props.settingsData && !!props.storesData && !!selectedStoreId.value && !props.termsAndConditionsProvisioned);
const alertDescriptionKey = computed<TranslationKey>(() =>
    props.canModifySettings
        ? 'payByLink.creation.storeForm.alerts.tcSetupRequired'
        : 'payByLink.creation.storeForm.alerts.tcSetupRequiredWithoutPermissions'
);

// TODO: wire up navigation to the terms and conditions settings flow once it is ported to Vue.
// eslint-disable-next-line no-empty-function
const handleSetupTermsAndConditions = () => {};
</script>

<template>
    <div :class="CLASS_NAMES.fieldsContainer">
        <SelectField name="store" :label="i18n.get('payByLink.creation.fields.store.label')" :items="props.selectItems" />
        <BentoAlert v-if="showTcAlert" :class="CLASS_NAMES.tcAlert" type="warning" role="alert">
            {{ i18n.get('payByLink.creation.storeForm.alerts.tcSetupRequiredTitle') }}
            <template #description>
                {{ i18n.get(alertDescriptionKey) }}
                <BentoButton v-if="props.canModifySettings" variant="tertiary" @click="handleSetupTermsAndConditions">
                    {{ i18n.get('payByLink.creation.storeForm.alerts.tcSetupRequiredAction') }}
                </BentoButton>
            </template>
        </BentoAlert>
    </div>
</template>
