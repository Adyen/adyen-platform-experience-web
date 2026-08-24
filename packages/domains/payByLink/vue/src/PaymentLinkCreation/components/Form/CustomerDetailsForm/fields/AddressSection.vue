<script setup lang="ts">
import { computed } from 'vue';
import { BentoInputField, BentoTypography } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import CountryField from './CountryField.vue';
import { useWizard } from '../../../../composables/wizardContext';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../../../domain/src';
import type { PaymentLinkFieldName } from '../../../../../../../domain/src';
import type { TranslationKey } from '@integration-components/core';
import styles from './AddressSection.module.scss';

type AddressPrefix = 'billingAddress' | 'deliveryAddress';

const props = defineProps<{
    prefix: AddressPrefix;
    title: string;
    isOptional?: boolean;
    countryItems: { id: string; name: string }[];
    countriesLoading?: boolean;
    copyEnabled?: boolean;
    copyToPrefix?: AddressPrefix;
}>();

const wizard = useWizard();
const { i18n } = wizard;

const lengths = computed(() => PAYMENT_LINK_CREATION_FIELD_LENGTHS[props.prefix]);

const STREET_ROW_FIELDS = ['street', 'houseNumberOrName'] as const;
const CITY_ROW_FIELDS = ['city', 'postalCode'] as const;

const STREET_ROW_FIELD_CLASSES = {
    street: styles.fieldLarge,
    houseNumberOrName: styles.fieldSmall,
};

function fieldName(field: string): PaymentLinkFieldName {
    return `${props.prefix}.${field}` as PaymentLinkFieldName;
}

function copyName(field: string): PaymentLinkFieldName | undefined {
    return props.copyToPrefix ? (`${props.copyToPrefix}.${field}` as PaymentLinkFieldName) : undefined;
}

function getConfig(field: string) {
    return wizard.getFieldConfig(fieldName(field));
}

function getError(field: string) {
    return wizard.getError(fieldName(field));
}

function getValue(field: string) {
    return (wizard.values.value[fieldName(field)] as string | undefined) ?? '';
}

function getLabel(field: string) {
    return i18n.get(`payByLink.creation.fields.${props.prefix}.${field}.label` as TranslationKey);
}

function getMaxLength(field: string) {
    return (lengths.value as Record<string, { max: number }>)[field]?.max;
}

function onInput(field: string, value: string | number) {
    wizard.setValue(fieldName(field), value);
    if (props.copyEnabled) {
        const target = copyName(field);
        if (target) wizard.setValue(target, value);
    }
}
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.titleContainer">
            <BentoTypography variant="title" stronger>{{ props.title }}</BentoTypography>
            <BentoTypography v-if="props.isOptional" variant="body" :class="styles.optionalLabel">
                {{ `(${i18n.get('payByLink.common.fields.optional.label')})` }}
            </BentoTypography>
        </div>
        <div :class="styles.row">
            <template v-for="field in STREET_ROW_FIELDS" :key="field">
                <FieldWrapper
                    v-if="getConfig(field).visible"
                    :name="fieldName(field)"
                    :error="getError(field)"
                    :class="STREET_ROW_FIELD_CLASSES[field]"
                >
                    <BentoInputField
                        :label="getLabel(field)"
                        type="text"
                        :model-value="getValue(field)"
                        :readonly="getConfig(field).readOnly"
                        :error="!!getError(field)"
                        :maxlength="getMaxLength(field)"
                        @input="(value: string | number) => onInput(field, value)"
                    />
                </FieldWrapper>
            </template>
        </div>
        <div :class="styles.row">
            <CountryField
                :name="fieldName('country')"
                :label="getLabel('country')"
                :items="props.countryItems"
                :loading="props.countriesLoading"
                :copy-to="copyName('country')"
                :copy-enabled="props.copyEnabled"
                hide-optional-label
            />
            <template v-for="field in CITY_ROW_FIELDS" :key="field">
                <FieldWrapper v-if="getConfig(field).visible" :name="fieldName(field)" :error="getError(field)">
                    <BentoInputField
                        :label="getLabel(field)"
                        type="text"
                        :model-value="getValue(field)"
                        :readonly="getConfig(field).readOnly"
                        :error="!!getError(field)"
                        :maxlength="getMaxLength(field)"
                        @input="(value: string | number) => onInput(field, value)"
                    />
                </FieldWrapper>
            </template>
        </div>
    </div>
</template>
