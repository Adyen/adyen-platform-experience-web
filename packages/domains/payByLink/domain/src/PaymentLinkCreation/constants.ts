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
