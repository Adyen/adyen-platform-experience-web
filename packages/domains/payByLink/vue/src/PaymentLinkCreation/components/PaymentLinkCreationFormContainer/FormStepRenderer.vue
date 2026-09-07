<script setup lang="ts">
import StoreForm from '../Form/StoreForm/StoreForm.vue';
import PaymentDetailsForm from '../Form/PaymentDetailsForm/PaymentDetailsForm.vue';
import CustomerDetailsForm from '../Form/CustomerDetailsForm/CustomerDetailsForm.vue';
import FormSummary from '../Form/Summary/FormSummary.vue';
import type { IPaymentLinkConfiguration, IPaymentLinkCountry, IPaymentLinkSettings, IPaymentLinkStore } from '@integration-components/types';

const props = defineProps<{
    currentFormStep: string;
    selectItems: { id: string; name: string }[];
    settingsData?: IPaymentLinkSettings;
    storesData?: { data?: IPaymentLinkStore[] };
    configurationData?: IPaymentLinkConfiguration;
    countriesData?: { data?: IPaymentLinkCountry[] };
    countryDatasetData?: { id: string; name: string }[];
    isFetchingCountries: boolean;
    isFetchingCountryDataset: boolean;
    termsAndConditionsProvisioned: boolean;
    canModifySettings: boolean;
    isSameAddress: boolean;
    onContactSupport?: () => void;
}>();

const emit = defineEmits<{
    'update:isSameAddress': [value: boolean];
    setupTermsAndConditions: [];
}>();
</script>

<template>
    <StoreForm
        v-if="props.currentFormStep === 'store'"
        :select-items="props.selectItems"
        :settings-data="props.settingsData"
        :stores-data="props.storesData?.data"
        :terms-and-conditions-provisioned="props.termsAndConditionsProvisioned"
        :can-modify-settings="props.canModifySettings"
        @setup-terms-and-conditions="emit('setupTermsAndConditions')"
    />
    <PaymentDetailsForm v-else-if="props.currentFormStep === 'payment'" :configuration="props.configurationData" />
    <CustomerDetailsForm
        v-else-if="props.currentFormStep === 'customer'"
        :is-same-address="props.isSameAddress"
        :countries-data="props.countriesData"
        :country-dataset-data="props.countryDatasetData"
        :is-fetching-countries="props.isFetchingCountries"
        :is-fetching-country-dataset="props.isFetchingCountryDataset"
        @update:is-same-address="(value: boolean) => emit('update:isSameAddress', value)"
    />
    <FormSummary v-else-if="props.currentFormStep === 'summary'" :select-items="props.selectItems" :country-dataset-data="props.countryDatasetData" />
</template>
