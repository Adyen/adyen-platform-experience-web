import type { Localization, TranslationKey } from '@integration-components/core';
import type { IPaymentLinkConfiguration, IPaymentLinkConfigurationElement } from '@integration-components/types';
import type { PaymentLinkFieldName, PaymentLinkFieldsVisibilityConfig } from './types';

export interface FormFieldConfig {
    fieldName: PaymentLinkFieldName;
    required: boolean;
    visible: boolean;
    includeInApiPayload: boolean;
    readOnly?: boolean;
    label?: TranslationKey;
    options?: IPaymentLinkConfigurationElement['options'];
}

export interface FormStepConfig {
    id: string;
    title?: string;
    fields: FormFieldConfig[];
    isOptional?: boolean;
}

interface GetFormStepsParams {
    i18n: Localization['i18n'];
    getFieldConfig: (field: keyof IPaymentLinkConfiguration) => IPaymentLinkConfigurationElement | undefined;
    visibilityConfig?: PaymentLinkFieldsVisibilityConfig;
}

type FieldVisibilityResult = {
    visible: boolean;
    includeInApiPayload: boolean;
    readOnly: boolean;
};

const resolveFieldVisibility = (
    fieldName: PaymentLinkFieldName,
    isFieldInConfigResponse: boolean,
    visibilityConfig?: PaymentLinkFieldsVisibilityConfig
): FieldVisibilityResult => {
    const configVisibility = visibilityConfig?.[fieldName as keyof typeof visibilityConfig];
    if (typeof configVisibility === 'string') {
        return {
            visible: configVisibility !== 'hidden' && isFieldInConfigResponse,
            includeInApiPayload: isFieldInConfigResponse,
            readOnly: configVisibility === 'readOnly',
        };
    }

    const [parentField, childField] = fieldName.split('.') as [keyof typeof visibilityConfig, string | undefined];
    const parentVisibility = visibilityConfig?.[parentField];

    if (parentVisibility) {
        if (typeof parentVisibility === 'string') {
            return {
                visible: parentVisibility !== 'hidden' && isFieldInConfigResponse,
                includeInApiPayload: isFieldInConfigResponse,
                readOnly: parentVisibility === 'readOnly',
            };
        }

        if (childField && typeof parentVisibility === 'object') {
            const childVisibility = (parentVisibility as Record<string, string>)[childField];
            if (childVisibility) {
                const isAddressField = parentField === 'billingAddress' || parentField === 'deliveryAddress';
                const canBeHidden = !isAddressField;

                return {
                    visible: (canBeHidden ? childVisibility !== 'hidden' : true) && isFieldInConfigResponse,
                    includeInApiPayload: isFieldInConfigResponse,
                    readOnly: childVisibility === 'readOnly',
                };
            }
        }
    }

    return {
        visible: isFieldInConfigResponse,
        includeInApiPayload: isFieldInConfigResponse,
        readOnly: false,
    };
};

export const getFormSteps = ({ getFieldConfig, visibilityConfig }: GetFormStepsParams): ReadonlyArray<FormStepConfig> => {
    const getFieldVisibility = (fieldName: PaymentLinkFieldName, isFieldInConfigResponse: boolean) =>
        resolveFieldVisibility(fieldName, isFieldInConfigResponse, visibilityConfig);

    return [
        {
            id: 'store',
            fields: [
                {
                    fieldName: 'store',
                    required: true,
                    visible: true,
                    includeInApiPayload: true,
                    label: 'payByLink.creation.summary.fields.store',
                },
            ],
            isOptional: false,
        },
        {
            id: 'payment',
            fields: [
                {
                    fieldName: 'linkValidity.quantity',
                    required: !!getFieldConfig('linkValidity')?.required,
                    ...getFieldVisibility('linkValidity.quantity', !!getFieldConfig('linkValidity')),
                    label: 'payByLink.creation.summary.fields.linkValidity',
                    options: getFieldConfig('linkValidity')?.options,
                },
                {
                    fieldName: 'linkValidity.durationUnit',
                    required: !!getFieldConfig('linkValidity')?.required,
                    ...getFieldVisibility('linkValidity.durationUnit', !!getFieldConfig('linkValidity')),
                },
                {
                    fieldName: 'amount.value',
                    required: !!getFieldConfig('amountValue')?.required,
                    ...getFieldVisibility('amount.value', !!getFieldConfig('amountValue')),
                    label: 'payByLink.creation.summary.fields.amountValue',
                },
                {
                    fieldName: 'amount.currency',
                    required: !!getFieldConfig('currency')?.required,
                    ...getFieldVisibility('amount.currency', !!getFieldConfig('currency')),
                    label: 'payByLink.creation.summary.fields.currency',
                    options: getFieldConfig('currency')?.options,
                },
                {
                    fieldName: 'reference',
                    required: !!getFieldConfig('merchantReference')?.required,
                    ...getFieldVisibility('reference', !!getFieldConfig('merchantReference')),
                    label: 'payByLink.creation.summary.fields.merchantReference',
                },
                {
                    fieldName: 'linkType',
                    required: !!getFieldConfig('linkType')?.required,
                    ...getFieldVisibility('linkType', !!getFieldConfig('linkType')),
                    label: 'payByLink.creation.summary.fields.linkType',
                },
                {
                    fieldName: 'description',
                    required: !!getFieldConfig('description')?.required,
                    ...getFieldVisibility('description', !!getFieldConfig('description')),
                    label: 'payByLink.creation.summary.fields.description',
                },
                {
                    fieldName: 'deliverAt',
                    required: !!getFieldConfig('deliveryDate')?.required,
                    ...getFieldVisibility('deliverAt', !!getFieldConfig('deliveryDate')),
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
                    ...getFieldVisibility('shopperReference', !!getFieldConfig('shopperReference')),
                    label: 'payByLink.creation.summary.fields.shopperReference',
                },
                {
                    fieldName: 'shopperName.firstName',
                    required: !!getFieldConfig('shopperName')?.required,
                    ...getFieldVisibility('shopperName.firstName', !!getFieldConfig('shopperName')),
                    label: 'payByLink.creation.summary.fields.shopperName',
                },
                {
                    fieldName: 'shopperName.lastName',
                    required: !!getFieldConfig('shopperName')?.required,
                    ...getFieldVisibility('shopperName.lastName', !!getFieldConfig('shopperName')),
                    label: 'payByLink.creation.summary.fields.shopperLastName',
                },
                {
                    fieldName: 'shopperEmail',
                    required: !!getFieldConfig('emailAddress')?.required,
                    ...getFieldVisibility('shopperEmail', !!getFieldConfig('emailAddress')),
                    label: 'payByLink.creation.summary.fields.emailAddress',
                },
                {
                    fieldName: 'sendSuccessEmailToShopper',
                    required: !!getFieldConfig('sendSuccessEmailToShopper')?.required,
                    ...getFieldVisibility('sendSuccessEmailToShopper', !!getFieldConfig('sendSuccessEmailToShopper')),
                },
                {
                    fieldName: 'sendLinkToShopper',
                    required: !!getFieldConfig('sendLinkToShopper')?.required,
                    ...getFieldVisibility('sendLinkToShopper', !!getFieldConfig('sendLinkToShopper')),
                    label: 'payByLink.creation.summary.fields.emailNotifications.emailCreation',
                },
                {
                    fieldName: 'telephoneNumber',
                    required: !!getFieldConfig('phoneNumber')?.required,
                    ...getFieldVisibility('telephoneNumber', !!getFieldConfig('phoneNumber')),
                    label: 'payByLink.creation.summary.fields.phoneNumber',
                },
                {
                    fieldName: 'countryCode',
                    required: !!getFieldConfig('countryCode')?.required,
                    ...getFieldVisibility('countryCode', !!getFieldConfig('countryCode')),
                    label: 'payByLink.creation.summary.fields.countryCode',
                    options: getFieldConfig('countryCode')?.options,
                },
                {
                    fieldName: 'deliveryAddress.street',
                    required: !!getFieldConfig('deliveryAddress')?.required,
                    ...getFieldVisibility('deliveryAddress.street', !!getFieldConfig('deliveryAddress')),
                    label: 'payByLink.creation.summary.fields.deliveryAddress.street',
                },
                {
                    fieldName: 'deliveryAddress.houseNumberOrName',
                    required: !!getFieldConfig('deliveryAddress')?.required,
                    ...getFieldVisibility('deliveryAddress.houseNumberOrName', !!getFieldConfig('deliveryAddress')),
                    label: 'payByLink.creation.summary.fields.deliveryAddress.houseNumberOrName',
                },
                {
                    fieldName: 'deliveryAddress.postalCode',
                    required: !!getFieldConfig('deliveryAddress')?.required,
                    ...getFieldVisibility('deliveryAddress.postalCode', !!getFieldConfig('deliveryAddress')),
                    label: 'payByLink.creation.summary.fields.deliveryAddress.postalCode',
                },
                {
                    fieldName: 'deliveryAddress.city',
                    required: !!getFieldConfig('deliveryAddress')?.required,
                    ...getFieldVisibility('deliveryAddress.city', !!getFieldConfig('deliveryAddress')),
                    label: 'payByLink.creation.summary.fields.deliveryAddress.city',
                },
                {
                    fieldName: 'deliveryAddress.country',
                    required: !!getFieldConfig('deliveryAddress')?.required,
                    ...getFieldVisibility('deliveryAddress.country', !!getFieldConfig('deliveryAddress')),
                    label: 'payByLink.creation.summary.fields.deliveryAddress.country',
                },
                {
                    fieldName: 'billingAddress.street',
                    required: !!getFieldConfig('billingAddress')?.required,
                    ...getFieldVisibility('billingAddress.street', !!getFieldConfig('billingAddress')),
                    label: 'payByLink.creation.summary.fields.billingAddress.street',
                },
                {
                    fieldName: 'billingAddress.houseNumberOrName',
                    required: !!getFieldConfig('billingAddress')?.required,
                    ...getFieldVisibility('billingAddress.houseNumberOrName', !!getFieldConfig('billingAddress')),
                    label: 'payByLink.creation.summary.fields.billingAddress.houseNumberOrName',
                },
                {
                    fieldName: 'billingAddress.postalCode',
                    required: !!getFieldConfig('billingAddress')?.required,
                    ...getFieldVisibility('billingAddress.postalCode', !!getFieldConfig('billingAddress')),
                    label: 'payByLink.creation.summary.fields.billingAddress.postalCode',
                },
                {
                    fieldName: 'billingAddress.city',
                    required: !!getFieldConfig('billingAddress')?.required,
                    ...getFieldVisibility('billingAddress.city', !!getFieldConfig('billingAddress')),
                    label: 'payByLink.creation.summary.fields.billingAddress.city',
                },
                {
                    fieldName: 'billingAddress.country',
                    required: !!getFieldConfig('billingAddress')?.required,
                    ...getFieldVisibility('billingAddress.country', !!getFieldConfig('billingAddress')),
                    label: 'payByLink.creation.summary.fields.billingAddress.country',
                },
                {
                    fieldName: 'shopperLocale',
                    required: !!getFieldConfig('shopperLocale')?.required,
                    ...getFieldVisibility('shopperLocale', !!getFieldConfig('shopperLocale')),
                    options: getFieldConfig('shopperLocale')?.options,
                },
            ],
            isOptional: false,
        },
        {
            id: 'summary',
            fields: [],
            isOptional: true,
        },
    ];
};
