<script setup lang="ts">
import { computed } from 'vue';
import { useWizard } from '../../../composables/wizardContext';
import ValidityField from './fields/ValidityField.vue';
import AmountField from './fields/AmountField.vue';
import SelectField from '../../fields/SelectField.vue';
import TextField from '../../fields/TextField.vue';
import DateField from './fields/DateField.vue';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../../domain/src';
import type { IPaymentLinkConfiguration, IPaymentLinkType, IPaymentLinkValidity } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';
import styles from '../FormLayout.module.scss';

const props = defineProps<{ configuration?: IPaymentLinkConfiguration }>();

const wizard = useWizard();
const { i18n } = wizard;

const LINK_TYPE_FALLBACK: IPaymentLinkType[] = ['open', 'singleUse'];

const validityOptions = computed<IPaymentLinkValidity[]>(() => (props.configuration?.linkValidity?.options as IPaymentLinkValidity[]) ?? []);
const currencyOptions = computed<string[]>(() => (props.configuration?.currency?.options as string[]) ?? []);
const linkTypeItems = computed(() => {
    const options = props.configuration?.linkType?.options?.length
        ? (props.configuration.linkType.options as IPaymentLinkType[])
        : LINK_TYPE_FALLBACK;
    return options.map(type => ({ id: type, name: i18n.get(`payByLink.creation.form.linkTypes.${type}` as TranslationKey) }));
});
</script>

<template>
    <div :class="styles.fieldsContainer">
        <ValidityField :options="validityOptions" />
        <AmountField :label="i18n.get('payByLink.creation.fields.amount.label')" :currency-options="currencyOptions" />
        <TextField
            name="reference"
            :label="i18n.get('payByLink.creation.fields.merchantReference.label')"
            :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.merchantReference.max"
        />
        <SelectField name="linkType" :label="i18n.get('payByLink.creation.fields.linkType.label')" :items="linkTypeItems" />
        <TextField
            name="description"
            :label="i18n.get('payByLink.creation.fields.description.label')"
            :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.description.max"
            :support-text="i18n.get('payByLink.creation.fields.description.supportText')"
        />
        <DateField name="deliverAt" :label="i18n.get('payByLink.creation.fields.deliverAt.label')" />
    </div>
</template>
