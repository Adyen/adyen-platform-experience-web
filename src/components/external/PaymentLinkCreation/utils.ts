import Localization, { TranslationKey } from '../../../core/Localization';
import { FieldValues } from '../../../hooks/form/types';
import { IPaymentLinkConfiguration, IPaymentLinkConfigurationElement } from '../../../types/api/models/payByLink';
import { PaymentLinkCreationFormValues } from './components/types';

interface FormFieldConfig {
    fieldName: FieldValues<PaymentLinkCreationFormValues>;
    required: boolean;
    visible: boolean;
    label?: TranslationKey;
    options?: IPaymentLinkConfigurationElement['options'];
}

export interface FormStepConfig {
    id: string;
    title?: string;
    fields: FormFieldConfig[];
    isOptional?: boolean;
}

export const scrollToFirstErrorField = (errorFields: string[], visibilityOffset: number): void => {
    const firstElement = errorFields
        .map(field => document.querySelector<HTMLElement>(`[name="${field}"]`))
        .filter((el): el is HTMLElement => el !== null)
        .reduce<HTMLElement | null>((topmost, el) => {
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
}: {
    i18n: Localization['i18n'];
    getFieldConfig: (field: keyof IPaymentLinkConfiguration) => IPaymentLinkConfigurationElement | undefined;
}): ReadonlyArray<FormStepConfig> => [
    {
        id: 'store',
        fields: [
            {
                fieldName: 'store',
                required: true,
                visible: true,
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
                visible: !!getFieldConfig('linkValidity'),
                label: 'payByLink.creation.summary.fields.linkValidity',
            },
            {
                fieldName: 'linkValidity.durationUnit',
                required: !!getFieldConfig('linkValidity')?.required,
                visible: !!getFieldConfig('linkValidity'),
            },
            {
                fieldName: 'amount.value',
                required: !!getFieldConfig('amountValue')?.required,
                visible: !!getFieldConfig('amountValue'),
                label: 'payByLink.creation.summary.fields.amountValue',
            },
            {
                fieldName: 'amount.currency',
                required: !!getFieldConfig('currency')?.required,
                visible: !!getFieldConfig('currency'),
                label: 'payByLink.creation.summary.fields.currency',
                options: getFieldConfig('currency')?.options,
            },
            {
                fieldName: 'reference',
                required: !!getFieldConfig('merchantReference')?.required,
                visible: !!getFieldConfig('merchantReference'),
                label: 'payByLink.creation.summary.fields.merchantReference',
            },
            {
                fieldName: 'linkType',
                required: !!getFieldConfig('linkType')?.required,
                visible: !!getFieldConfig('linkType'),
                label: 'payByLink.creation.summary.fields.linkType',
            },
            {
                fieldName: 'description',
                required: !!getFieldConfig('description')?.required,
                visible: !!getFieldConfig('description'),
                label: 'payByLink.creation.summary.fields.description',
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
                label: 'payByLink.creation.summary.fields.shopperReference',
            },
            {
                fieldName: 'shopperName.firstName',
                required: !!getFieldConfig('shopperName')?.required,
                visible: !!getFieldConfig('shopperName'),
                label: 'payByLink.creation.summary.fields.shopperName',
            },
            {
                fieldName: 'shopperName.lastName',
                required: !!getFieldConfig('shopperName')?.required,
                visible: !!getFieldConfig('shopperName'),
                label: 'payByLink.creation.summary.fields.shopperLastName',
            },
            {
                fieldName: 'shopperEmail',
                required: !!getFieldConfig('emailAddress')?.required,
                visible: !!getFieldConfig('emailAddress'),
                label: 'payByLink.creation.summary.fields.emailAddress',
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
                label: 'payByLink.creation.summary.fields.emailAddress',
            },
            {
                fieldName: 'telephoneNumber',
                required: !!getFieldConfig('phoneNumber')?.required,
                visible: !!getFieldConfig('phoneNumber'),
                label: 'payByLink.creation.summary.fields.phoneNumber',
            },
            {
                fieldName: 'countryCode',
                required: !!getFieldConfig('countryCode')?.required,
                visible: !!getFieldConfig('countryCode'),
                label: 'payByLink.creation.summary.fields.countryCode',
                options: getFieldConfig('countryCode')?.options,
            },
            {
                fieldName: 'deliveryAddress.street',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.creation.summary.fields.deliveryAddress.street',
            },
            {
                fieldName: 'deliveryAddress.houseNumberOrName',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.creation.summary.fields.deliveryAddress.houseNumberOrName',
            },
            {
                fieldName: 'deliveryAddress.postalCode',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.creation.summary.fields.deliveryAddress.postalCode',
            },
            {
                fieldName: 'deliveryAddress.city',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.creation.summary.fields.deliveryAddress.city',
            },
            {
                fieldName: 'deliveryAddress.country',
                required: !!getFieldConfig('deliveryAddress')?.required,
                visible: !!getFieldConfig('deliveryAddress'),
                label: 'payByLink.creation.summary.fields.deliveryAddress.country',
            },
            {
                fieldName: 'billingAddress.street',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.creation.summary.fields.billingAddress.street',
            },
            {
                fieldName: 'billingAddress.houseNumberOrName',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.creation.summary.fields.billingAddress.houseNumberOrName',
            },
            {
                fieldName: 'billingAddress.postalCode',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.creation.summary.fields.billingAddress.postalCode',
            },
            {
                fieldName: 'billingAddress.city',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.creation.summary.fields.billingAddress.city',
            },
            {
                fieldName: 'billingAddress.country',
                required: !!getFieldConfig('billingAddress')?.required,
                visible: !!getFieldConfig('billingAddress'),
                label: 'payByLink.creation.summary.fields.billingAddress.country',
            },
            {
                fieldName: 'shopperLocale',
                required: !!getFieldConfig('shopperLocale')?.required,
                visible: !!getFieldConfig('shopperLocale'),
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
