import Localization, { TranslationKey } from '../../../core/Localization';
import { FieldValues } from '../../../hooks/form/types';
import { IPaymentLinkConfiguration, IPaymentLinkConfigurationElement } from '../../../types/api/models/payByLink';
import { PaymentLinkCreationFormValues } from './components/types';
import { PaymentLinkFieldsVisibilityConfig } from '../../types';

interface FormFieldConfig {
    fieldName: FieldValues<PaymentLinkCreationFormValues>;
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

export const scrollToFirstErrorField = (errorFields: string[], visibilityOffset: number, scope?: ParentNode | null): void => {
    if (errorFields.length === 0) return;

    const queryScope = scope ?? document;

    const errorFieldsSelector = errorFields.map(field => `[name="${field}"]`).join(',');
    const elements = queryScope.querySelectorAll<HTMLElement>(`:scope ${errorFieldsSelector}`);

    const firstElement = Array.from(elements).reduce<HTMLElement | null>((topmost, el) => {
        if (!topmost) return el;
        return el.getBoundingClientRect().top < topmost.getBoundingClientRect().top ? el : topmost;
    }, null);

    if (!firstElement) return;

    const rect = firstElement.getBoundingClientRect();
    const isVisible = rect.top >= visibilityOffset && rect.bottom <= window.innerHeight;

    if (!isVisible) {
        firstElement.style.scrollMarginTop = `${visibilityOffset}px`;
        firstElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

export const getFormSteps = ({
    i18n,
    getFieldConfig,
    visibilityConfig,
}: {
    i18n: Localization['i18n'];
    getFieldConfig: (field: keyof IPaymentLinkConfiguration) => IPaymentLinkConfigurationElement | undefined;
    visibilityConfig?: PaymentLinkFieldsVisibilityConfig;
}): ReadonlyArray<FormStepConfig> => {
    const getFieldVisibility = (fieldName: FieldValues<PaymentLinkCreationFormValues>, isFieldInConfigResponse: boolean) => {
        // Check for direct field config first (e.g., 'description', 'reference')
        const configVisibility = visibilityConfig?.[fieldName as keyof typeof visibilityConfig];
        if (typeof configVisibility === 'string') {
            return {
                visible: configVisibility !== 'hidden' && isFieldInConfigResponse,
                includeInApiPayload: isFieldInConfigResponse,
                readOnly: configVisibility === 'readOnly',
            };
        }

        // Check for parent field config (e.g., 'amount' for 'amount.value')
        const [parentField, childField] = fieldName.split('.') as [keyof typeof visibilityConfig, string | undefined];
        const parentVisibility = visibilityConfig?.[parentField];

        if (parentVisibility) {
            // Parent visibility as string applies to all children (e.g., { amount: 'readOnly' })
            if (typeof parentVisibility === 'string') {
                return {
                    visible: parentVisibility !== 'hidden' && isFieldInConfigResponse,
                    includeInApiPayload: isFieldInConfigResponse,
                    readOnly: parentVisibility === 'readOnly',
                };
            }

            // Parent visibility as object with child config (e.g., { amount: { currency: 'readOnly' } })
            if (childField && typeof parentVisibility === 'object') {
                const childVisibility = (parentVisibility as Record<string, string>)[childField];
                if (childVisibility) {
                    // Address fields cannot be hidden individually (only readOnly) because
                    // when any address field is filled, all address fields become required.
                    // Hiding individual fields would prevent proper validation.
                    // The entire address section can still be hidden at the parent level.
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
                    label: 'payByLink.creation.summary.fields.emailAddress',
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
            title: i18n.get('payByLink.creation.form.steps.customer'),
            fields: [],
            isOptional: true,
        },
    ];
};
