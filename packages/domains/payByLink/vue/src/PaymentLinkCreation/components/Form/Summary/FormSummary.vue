<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoDivider, BentoStructuredList, BentoStructuredListItem, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { useWizard } from '../../../composables/wizardContext';
import { PAYMENT_LINK_CREATION_SUMMARY_INVISIBLE_FIELDS } from '../../../../../../domain/src';
import type { FormFieldConfig } from '../../../../../../domain/src';
import type { TranslationKey } from '@integration-components/core';
import type { IPaymentLinkType } from '@integration-components/types';
import styles from './FormSummary.module.scss';

const props = defineProps<{
    selectItems: { id: string; name: string }[];
    countryDatasetData?: { id: string; name: string }[];
}>();

const wizard = useWizard();
const { i18n } = wizard;

const INVISIBLE = PAYMENT_LINK_CREATION_SUMMARY_INVISIBLE_FIELDS as string[];

interface SummaryRow {
    id: string;
    label: TranslationKey;
    rendered: string;
}

const stepFields = (id: string): FormFieldConfig[] => wizard.steps.value.find(step => step.id === id)?.fields ?? [];

function rawValue(name: string) {
    return wizard.values.value[name];
}
function displayValue(name: string) {
    return wizard.displayValues.value[name];
}

function renderValue(field: FormFieldConfig): string {
    const id = field.fieldName;
    const value = rawValue(id);
    const display = displayValue(id);

    switch (id) {
        case 'linkValidity.quantity': {
            const unit = rawValue('linkValidity.durationUnit');
            if (!value || !unit) return '';
            return i18n.get(`payByLink.creation.fields.validity.linkValidityUnit.${unit}` as TranslationKey, {
                values: { quantity: value },
                count: Number(value),
            });
        }
        case 'amount.value': {
            const currency = rawValue('amount.currency') as string | undefined;
            if (value === undefined || value === '' || !currency) return '';
            return i18n.amount(Number(value), currency);
        }
        case 'linkType':
            return value ? i18n.get(`payByLink.creation.form.linkTypes.${value as IPaymentLinkType}`) : '';
        case 'countryCode':
        case 'deliveryAddress.country':
        case 'billingAddress.country':
            return props.countryDatasetData?.find(country => country.id === value)?.name ?? display ?? `${value ?? ''}`;
        default:
            return display ?? (value === undefined || value === null ? '' : `${value}`);
    }
}

function toRows(fields: FormFieldConfig[]): SummaryRow[] {
    return fields
        .filter(field => field.visible && !INVISIBLE.includes(field.fieldName) && !!field.label)
        .map(field => ({ id: field.fieldName, label: field.label as TranslationKey, rendered: renderValue(field) }))
        .filter(row => row.rendered !== '');
}

const paymentRows = computed<SummaryRow[]>(() => {
    const storeValue = rawValue('store') as string | undefined;
    const storeRow: SummaryRow[] = storeValue
        ? [
              {
                  id: 'store',
                  label: 'payByLink.creation.summary.fields.store' as TranslationKey,
                  rendered: displayValue('store') ?? props.selectItems.find(item => item.id === storeValue)?.name ?? storeValue,
              },
          ]
        : [];
    return [...storeRow, ...toRows(stepFields('payment'))];
});

const customerFields = computed(() => stepFields('customer'));
const nonAddressRows = computed(() =>
    toRows(customerFields.value.filter(field => !field.fieldName.startsWith('deliveryAddress.') && !field.fieldName.startsWith('billingAddress.')))
);
const deliveryRows = computed(() => toRows(customerFields.value.filter(field => field.fieldName.startsWith('deliveryAddress.'))));
const billingRows = computed(() => toRows(customerFields.value.filter(field => field.fieldName.startsWith('billingAddress.'))));

const sendLink = computed(() => rawValue('sendLinkToShopper') === true);
const sendSuccess = computed(() => rawValue('sendSuccessEmailToShopper') === true);
const showEmailNotifications = computed(() => sendLink.value || sendSuccess.value);
</script>

<template>
    <section :class="styles.root">
        <section :class="styles.section">
            <BentoTypography variant="title" :class="styles.sectionTitle">
                {{ i18n.get('payByLink.creation.summary.paymentDetails') }}
            </BentoTypography>
            <BentoStructuredList layout="42-58">
                <BentoStructuredListItem v-for="row in paymentRows" :key="row.id" :label="i18n.get(row.label)">
                    <BentoTypography variant="body">{{ row.rendered }}</BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
        </section>

        <template v-if="nonAddressRows.length">
            <BentoDivider />
            <section :class="styles.section">
                <BentoTypography variant="title" :class="styles.sectionTitle">
                    {{ i18n.get('payByLink.creation.summary.shopperInformation') }}
                </BentoTypography>
                <BentoStructuredList layout="42-58">
                    <BentoStructuredListItem v-for="row in nonAddressRows" :key="row.id" :label="i18n.get(row.label)">
                        <BentoTypography variant="body">{{ row.rendered }}</BentoTypography>
                    </BentoStructuredListItem>
                    <BentoStructuredListItem v-if="showEmailNotifications" :label="i18n.get('payByLink.creation.summary.fields.emailNotifications')">
                        <div :class="styles.tagsContainer">
                            <BentoTag v-if="sendLink">{{ i18n.get('payByLink.creation.summary.fields.emailNotifications.emailCreation') }}</BentoTag>
                            <BentoTag v-if="sendSuccess">{{
                                i18n.get('payByLink.creation.summary.fields.emailNotifications.paymentSuccess')
                            }}</BentoTag>
                        </div>
                    </BentoStructuredListItem>
                </BentoStructuredList>
            </section>
        </template>

        <section v-if="deliveryRows.length" :class="styles.section">
            <BentoTypography variant="body" stronger :class="styles.sectionTitle">
                {{ i18n.get('payByLink.creation.summary.deliveryAddress') }}
            </BentoTypography>
            <BentoStructuredList layout="42-58">
                <BentoStructuredListItem v-for="row in deliveryRows" :key="row.id" :label="i18n.get(row.label)">
                    <BentoTypography variant="body">{{ row.rendered }}</BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
        </section>

        <section v-if="billingRows.length" :class="styles.section">
            <BentoTypography variant="body" stronger :class="styles.sectionTitle">
                {{ i18n.get('payByLink.creation.summary.billingAddress') }}
            </BentoTypography>
            <BentoStructuredList layout="42-58">
                <BentoStructuredListItem v-for="row in billingRows" :key="row.id" :label="i18n.get(row.label)">
                    <BentoTypography variant="body">{{ row.rendered }}</BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
        </section>

        <BentoAlert :class="styles.alert" type="highlight" variant="tip" role="alert">
            <template #description>{{ i18n.get('payByLink.creation.summary.alertDescription') }}</template>
        </BentoAlert>
    </section>
</template>
