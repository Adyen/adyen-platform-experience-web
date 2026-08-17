import type { IPaymentLinkValidity } from '@integration-components/types';
import type { PaymentLinkFieldName } from './types';

export const PAYMENT_LINK_CREATION_FIELD_LENGTHS = {
    emailAddress: {
        max: 500,
    },
    merchantReference: {
        min: 3,
        max: 256,
    },
    shopperEmail: {
        max: 500,
    },
    shopperName: {
        firstName: {
            max: 80,
        },
        lastName: {
            max: 80,
        },
    },
    telephoneNumber: {
        max: 32,
    },
    billingAddress: {
        street: {
            max: 3000,
        },
        houseNumberOrName: {
            max: 3000,
        },
        postalCode: {
            max: 10,
        },
        city: {
            max: 3000,
        },
    },
    deliveryAddress: {
        street: {
            max: 3000,
        },
        houseNumberOrName: {
            max: 3000,
        },
        postalCode: {
            max: 10,
        },
        city: {
            max: 3000,
        },
    },
    shopperReference: {
        min: 3,
        max: 256,
    },
    description: {
        max: 280,
    },
    shopperLocale: {
        max: 32,
    },
} as const;

export const LINK_VALIDITY_DURATION_UNITS = ['hour', 'minute', 'day', 'week'] as IPaymentLinkValidity['durationUnit'][];

export const MAX_AMOUNT = 10_000_000_000_000; // 10 billion
export const MAX_VALIDITY_DAYS = 70;
export const FLEXIBLE_VALIDITY_ID = 'flexible';

export const PAYMENT_LINK_CREATION_SUMMARY_INVISIBLE_FIELDS: PaymentLinkFieldName[] = [
    'amount.currency',
    'linkValidity.durationUnit',
    'deliverAt',
    'shopperLocale',
    'sendSuccessEmailToShopper',
    'sendLinkToShopper',
];

export const PAYMENT_LINK_CREATION_CLASS_NAMES = {
    base: 'adyen-pe-payment-link-creation',
    form: 'adyen-pe-payment-link-creation-form',
    formComponent: 'adyen-pe-payment-link-creation-form__component',
    formHeader: 'adyen-pe-payment-link-creation-form__header',
    formContainer: 'adyen-pe-payment-link-creation-form__container',
    fieldsContainer: 'adyen-pe-payment-link-creation-form__fields-container',
    buttonsContainer: 'adyen-pe-payment-link-creation-form__buttons-container',
    submitButton: 'adyen-pe-payment-link-creation-form__submit-button',
    validityContainer: 'adyen-pe-payment-link-creation-form__validity-container',
    shopperNameContainer: 'adyen-pe-payment-link-creation-form__shopper-name-container',
    addressContainer: 'adyen-pe-payment-link-creation-form__address-container',
    addressTitleContainer: 'adyen-pe-payment-link-creation-form__address-title-container',
    addressRow: 'adyen-pe-payment-link-creation-form__address-row',
    addressFieldLarge: 'adyen-pe-payment-link-creation-form__address-field--large',
    addressFieldSmall: 'adyen-pe-payment-link-creation-form__address-field--small',
    addressOptionalLabel: 'adyen-pe-payment-link-creation-form__field-label-optional',
    sameAddressCheckbox: 'adyen-pe-payment-link-creation-form__field-checkbox',
    tcAlert: 'adyen-pe-payment-link-creation-form__tc-alert',
    errorAlert: 'adyen-pe-payment-link-creation-form__error-alert',
    invalidFieldsError: 'adyen-pe-payment-link-creation-form__invalid-fields-error',
    contactSupport: 'adyen-pe-payment-link-creation-form__contact-support',
    warningAlert: 'adyen-pe-payment-link-creation-form__warning-alert',
    skeleton: 'adyen-pe-payment-link-creation-form__skeleton',
    skeletonItem: 'adyen-pe-payment-link-creation-form__skeleton-item',
    summary: 'adyen-pe-payment-link-creation-form-summary',
    summarySection: 'adyen-pe-payment-link-creation-form-summary__section',
    summarySectionTitle: 'adyen-pe-payment-link-creation-form-summary__section-title',
    summaryTagsContainer: 'adyen-pe-payment-link-creation-form-summary__tags-container',
    summaryAlert: 'adyen-pe-payment-link-creation-form-summary__alert',
    success: 'adyen-pe-payment-link-creation-form-success',
    successContent: 'adyen-pe-payment-link-creation-form-success__content',
    successIcon: 'adyen-pe-payment-link-creation-form-success__icon',
    successTitle: 'adyen-pe-payment-link-creation-form-success__title',
    successDescription: 'adyen-pe-payment-link-creation-form-success__description',
    successActions: 'adyen-pe-payment-link-creation-form-success__actions',
} as const;
