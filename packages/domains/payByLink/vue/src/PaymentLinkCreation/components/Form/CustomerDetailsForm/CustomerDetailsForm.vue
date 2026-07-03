<script setup lang="ts">
import { computed } from 'vue';
import { BentoCheckbox } from '@adyen/bento-vue3';
import TextField from '../../fields/TextField.vue';
import CountryField from './fields/CountryField.vue';
import ShopperPhoneField from './fields/ShopperPhoneField.vue';
import LanguageField from './fields/LanguageField.vue';
import AddressSection from './fields/AddressSection.vue';
import { useWizard } from '../../../composables/wizardContext';
import { useAddressSections } from './useAddressSections';
import { PAYMENT_LINK_CREATION_CLASS_NAMES, PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../../domain/src';
import type { PaymentLinkFieldName } from '../../../../../../domain/src';
import type { IPaymentLinkCountry } from '@integration-components/types';
import './CustomerDetailsForm.scss';

const props = defineProps<{
    isSameAddress: boolean;
    countriesData?: { data?: IPaymentLinkCountry[] };
    countryDatasetData?: { id: string; name: string }[];
    isFetchingCountries: boolean;
    isFetchingCountryDataset: boolean;
}>();

const emit = defineEmits<{ 'update:isSameAddress': [value: boolean] }>();

const wizard = useWizard();
const { i18n } = wizard;
const CLASS_NAMES = PAYMENT_LINK_CREATION_CLASS_NAMES;
const { showBillingFirst, isSameAddressCopyEnabled, billingState, deliveryState } = useAddressSections();

const isNameVisible = computed(() => wizard.getFieldConfig('shopperName.firstName').visible || wizard.getFieldConfig('shopperName.lastName').visible);

const baseCountryList = computed<{ id: string; name: string }[]>(() => {
    if (props.countryDatasetData?.length) return props.countryDatasetData;
    return (props.countriesData?.data ?? []).map(({ countryCode, countryName }) => ({ id: countryCode, name: countryName }));
});

const allowedCountryCodes = computed(() => new Set((props.countriesData?.data ?? []).map(({ countryCode }) => countryCode).filter(Boolean)));

const addressCountryItems = computed(() =>
    baseCountryList.value
        .filter(({ id }) => !allowedCountryCodes.value.size || allowedCountryCodes.value.has(id))
        .sort((a, b) => a.name.localeCompare(b.name))
);

const shopperCountryItems = computed(() => {
    const configOptions = wizard.getFieldConfig('countryCode').options as string[] | undefined;
    const allowed = new Set(configOptions?.length ? configOptions : [...allowedCountryCodes.value]);
    return baseCountryList.value.filter(({ id }) => !allowed.size || allowed.has(id)).sort((a, b) => a.name.localeCompare(b.name));
});

const countriesLoading = computed(() => props.isFetchingCountries || props.isFetchingCountryDataset);

const isBillingVisible = computed(() => wizard.getFieldConfig('billingAddress.street').visible);
const isDeliveryVisible = computed(() => wizard.getFieldConfig('deliveryAddress.street').visible);
const isBillingOptional = computed(() => !billingState.value.isRequired);
const isDeliveryOptional = computed(() => !deliveryState.value.isRequired);

const showDeliveryDefault = computed(() => isDeliveryVisible.value && !showBillingFirst.value);
const showBillingDefault = computed(
    () => !showBillingFirst.value && isBillingVisible.value && (!isSameAddressCopyEnabled.value || !props.isSameAddress || !isDeliveryVisible.value)
);
const showDeliveryAfterBilling = computed(() => showBillingFirst.value && (!isSameAddressCopyEnabled.value || !props.isSameAddress));

const ADDRESS_FIELDS = ['street', 'houseNumberOrName', 'postalCode', 'city', 'country'] as const;

function toggleSameAddress(value: boolean) {
    const source = showBillingFirst.value ? 'billingAddress' : 'deliveryAddress';
    const target = showBillingFirst.value ? 'deliveryAddress' : 'billingAddress';
    ADDRESS_FIELDS.forEach(field => {
        const sourceName = `${source}.${field}` as PaymentLinkFieldName;
        const targetName = `${target}.${field}` as PaymentLinkFieldName;
        wizard.setValue(targetName, value ? wizard.getValue(sourceName) : '');
    });
    emit('update:isSameAddress', value);
}

function onCheckboxUpdate(value: boolean | string | string[]) {
    toggleSameAddress(!!value);
}
</script>

<template>
    <div :class="CLASS_NAMES.fieldsContainer">
        <TextField
            name="shopperReference"
            :label="i18n.get('payByLink.creation.fields.shopperReference.label')"
            :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperReference.max"
        />
        <div v-if="isNameVisible" :class="CLASS_NAMES.shopperNameContainer">
            <TextField
                name="shopperName.firstName"
                :label="i18n.get('payByLink.creation.fields.shopperName.label')"
                :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.firstName.max"
            />
            <TextField
                name="shopperName.lastName"
                :label="i18n.get('payByLink.creation.fields.shopperLastName.label')"
                :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperName.lastName.max"
            />
        </div>
        <TextField
            name="shopperEmail"
            :label="i18n.get('payByLink.creation.fields.shopperEmail.label')"
            :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.shopperEmail.max"
        />
        <ShopperPhoneField />
        <CountryField
            name="countryCode"
            :label="i18n.get('payByLink.creation.fields.country.label')"
            :items="shopperCountryItems"
            :loading="countriesLoading"
        />

        <template v-if="showDeliveryDefault">
            <AddressSection
                prefix="deliveryAddress"
                :title="i18n.get('payByLink.creation.sections.deliveryAddress.label')"
                :is-optional="isDeliveryOptional"
                :country-items="addressCountryItems"
                :countries-loading="countriesLoading"
                :copy-enabled="isSameAddressCopyEnabled && props.isSameAddress"
                copy-to-prefix="billingAddress"
            />
            <div v-if="isSameAddressCopyEnabled">
                <BentoCheckbox :class="CLASS_NAMES.sameAddressCheckbox" :model-value="props.isSameAddress" @update:model-value="onCheckboxUpdate">
                    {{ i18n.get('payByLink.creation.fields.shippingAndBillingSameAddress.label') }}
                </BentoCheckbox>
            </div>
        </template>

        <AddressSection
            v-if="showBillingDefault"
            prefix="billingAddress"
            :title="i18n.get('payByLink.creation.fields.billingAddress.label')"
            :is-optional="isBillingOptional"
            :country-items="addressCountryItems"
            :countries-loading="countriesLoading"
        />

        <template v-if="showBillingFirst">
            <AddressSection
                prefix="billingAddress"
                :title="i18n.get('payByLink.creation.fields.billingAddress.label')"
                :country-items="addressCountryItems"
                :countries-loading="countriesLoading"
                :copy-enabled="isSameAddressCopyEnabled && props.isSameAddress"
                copy-to-prefix="deliveryAddress"
            />
            <div v-if="isSameAddressCopyEnabled">
                <BentoCheckbox :class="CLASS_NAMES.sameAddressCheckbox" :model-value="props.isSameAddress" @update:model-value="onCheckboxUpdate">
                    {{ i18n.get('payByLink.creation.fields.shippingAndBillingSameAddress.label') }}
                </BentoCheckbox>
            </div>
            <AddressSection
                v-if="showDeliveryAfterBilling"
                prefix="deliveryAddress"
                :title="i18n.get('payByLink.creation.sections.deliveryAddress.label')"
                :is-optional="true"
                :country-items="addressCountryItems"
                :countries-loading="countriesLoading"
            />
        </template>

        <LanguageField />
    </div>
</template>
