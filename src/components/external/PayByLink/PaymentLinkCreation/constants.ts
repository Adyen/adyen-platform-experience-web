import { IPaymentLinkValidity } from '../../../../types/api/models/payByLink';

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
