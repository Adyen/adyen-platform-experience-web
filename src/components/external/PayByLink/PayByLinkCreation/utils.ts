import Localization, { TranslationKey } from '../../../../core/Localization';
import { FieldValues } from '../../../../hooks/form/types';
import { PaymentLinkConfiguration } from '../../../../types/api/models/payByLink';
import { PBLFormValues } from './components/types';

interface FormFieldConfig {
    fieldName: FieldValues<PBLFormValues>;
    required: boolean;
    visible: boolean;
    label?: TranslationKey;
}

export interface FormStepConfig {
    id: string;
    title?: string;
    fields: FormFieldConfig[];
    isOptional?: boolean;
}

export const getFormSteps = ({
    i18n,
    getFieldConfig,
}: {
    i18n: Localization['i18n'];
    getFieldConfig: (field: keyof PaymentLinkConfiguration) => { required?: boolean } | undefined;
}): ReadonlyArray<FormStepConfig> => [
    {
        id: 'store',
        fields: [
            {
                fieldName: 'store',
                required: true,
                visible: true,
                label: 'payByLink.linkCreation.summary.fields.store',
            },
        ],
        isOptional: false,
    },
    {
        id: 'payment',
        fields: [
            {
                fieldName: 'linkValidity',
                required: !!getFieldConfig('linkValidity')?.required,
                visible: !!getFieldConfig('linkValidity'),
                label: 'payByLink.linkCreation.summary.fields.linkValidity',
            },
            {
                fieldName: 'amount.value',
                required: !!getFieldConfig('amountValue')?.required,
                visible: !!getFieldConfig('amountValue'),
                label: 'payByLink.linkCreation.summary.fields.amountValue',
            },
            {
                fieldName: 'amount.currency',
                required: !!getFieldConfig('currency')?.required,
                visible: !!getFieldConfig('currency'),
                label: 'payByLink.linkCreation.summary.fields.currency',
            },
            {
                fieldName: 'reference',
                required: !!getFieldConfig('merchantReference')?.required,
                visible: !!getFieldConfig('merchantReference'),
                label: 'payByLink.linkCreation.summary.fields.merchantReference',
            },
            {
                fieldName: 'linkType',
                required: !!getFieldConfig('linkType')?.required,
                visible: !!getFieldConfig('linkType'),
                label: 'payByLink.linkCreation.summary.fields.linkType',
            },
            {
                fieldName: 'description',
                required: !!getFieldConfig('description')?.required,
                visible: !!getFieldConfig('description'),
                label: 'payByLink.linkCreation.summary.fields.description',
            },
            {
                fieldName: 'deliverAt',
                required: !!getFieldConfig('deliveryDate')?.required,
                visible: !!getFieldConfig('deliveryDate'),
            },
        ],
        isOptional: false,
    },
    {
        id: 'customer',
        fields: [
            {
                fieldName: 'shopperReference',
                required: !!getFieldConfig('shopperReference')?.required,
                visible: !!getFieldConfig('shopperReference'),
                label: 'payByLink.linkCreation.summary.fields.shopperReference',
            },
            {
                fieldName: 'shopperName.firstName',
                required: !!getFieldConfig('shopperName')?.required,
                visible: !!getFieldConfig('shopperName'),
                label: 'payByLink.linkCreation.summary.fields.shopperName',
            },
            {
                fieldName: 'shopperName.lastName',
                required: !!getFieldConfig('shopperName')?.required,
                visible: !!getFieldConfig('shopperName'),
                label: 'payByLink.linkCreation.summary.fields.shopperLastName',
            },
            {
                fieldName: 'shopperEmail',
                required: !!getFieldConfig('emailAddress')?.required,
                visible: !!getFieldConfig('emailAddress'),
                label: 'payByLink.linkCreation.summary.fields.emailAddress',
            },
            {
                fieldName: 'sendSuccessEmailToShopper',
                required: !!getFieldConfig('sendSuccessEmailToShopper')?.required,
                visible: !!getFieldConfig('sendSuccessEmailToShopper'),
            },
            {
                fieldName: 'sendLinkToShopper',
                required: !!getFieldConfig('sendLinkToShopper')?.required,
                visible: !!getFieldConfig('sendLinkToShopper'),
                label: 'payByLink.linkCreation.summary.fields.emailAddress',
            },
            {
                fieldName: 'telephoneNumber',
                required: !!getFieldConfig('phoneNumber')?.required,
                visible: !!getFieldConfig('phoneNumber'),
                label: 'payByLink.linkCreation.summary.fields.phoneNumber',
            },
            {
                fieldName: 'countryCode',
                required: !!getFieldConfig('countryCode')?.required,
                visible: !!getFieldConfig('countryCode'),
                label: 'payByLink.linkCreation.summary.fields.countryCode',
            },
            {
                fieldName: 'deliveryAddress.street',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.linkCreation.summary.fields.deliveryAddress.street',
            },
            {
                fieldName: 'deliveryAddress.houseNumberOrName',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.linkCreation.summary.fields.deliveryAddress.houseNumberOrName',
            },
            {
                fieldName: 'deliveryAddress.postalCode',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.linkCreation.summary.fields.deliveryAddress.postalCode',
            },
            {
                fieldName: 'deliveryAddress.city',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.linkCreation.summary.fields.deliveryAddress.city',
            },
            {
                fieldName: 'deliveryAddress.country',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.linkCreation.summary.fields.deliveryAddress.country',
            },
            {
                fieldName: 'billingAddress.street',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.linkCreation.summary.fields.billingAddress.street',
            },
            {
                fieldName: 'billingAddress.houseNumberOrName',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.linkCreation.summary.fields.billingAddress.houseNumberOrName',
            },
            {
                fieldName: 'billingAddress.postalCode',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.linkCreation.summary.fields.billingAddress.postalCode',
            },
            {
                fieldName: 'billingAddress.city',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.linkCreation.summary.fields.billingAddress.city',
            },
            {
                fieldName: 'billingAddress.country',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.linkCreation.summary.fields.billingAddress.country',
            },
            {
                fieldName: 'shopperLocale',
                required: !!getFieldConfig('shopperLocale')?.required,
                visible: !!getFieldConfig('shopperLocale'),
            },
        ],
        isOptional: false,
    },
    {
        id: 'summary',
        title: i18n.get('payByLink.linkCreation.form.steps.customer'),
        fields: [],
        isOptional: true,
    },
];
