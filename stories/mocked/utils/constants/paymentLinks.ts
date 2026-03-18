import { PaymentLinkCreationComponentProps } from '../../../../src/components/types';

export const PAYMENT_LINKS_FIELDS_CONFIG = {
    data: {
        amount: {
            currency: 'EUR',
            value: 12345,
        },
        deliveryAddress: {
            city: 'Madrid',
            country: 'ES',
            houseNumberOrName: '123',
            postalCode: '28001',
            street: 'Gran Via',
        },
        billingAddress: {
            city: 'Medellin',
            country: 'MX',
            houseNumberOrName: '1',
            postalCode: '05001',
            street: 'Calle 25 #34-12',
        },
        description: 'This is a test description',
        reference: 'SHP000001',
        linkType: 'open',
        deliverAt: '2025-12-09T11:39:24.458Z',
        shopperEmail: 'test@example.com',
        shopperLocale: 'en-US',
        shopperReference: 'test',
        shopperName: {
            firstName: 'John',
            lastName: 'Doe',
        },
        countryCode: 'ES',
        telephoneNumber: '+34 3002119220',
        linkValidity: {
            durationUnit: 'week',
            quantity: 3,
        },
    },
    visibility: {
        amount: {
            value: 'readOnly',
            currency: 'readOnly',
        },
        deliveryAddress: {
            city: 'readOnly',
            country: 'readOnly',
            houseNumberOrName: 'readOnly',
            postalCode: 'readOnly',
            street: 'readOnly',
        },
        billingAddress: {
            city: 'readOnly',
            country: 'readOnly',
            houseNumberOrName: 'readOnly',
            postalCode: 'readOnly',
            street: 'readOnly',
        },
        description: 'readOnly',
        reference: 'readOnly',
        linkType: 'readOnly',
        deliverAt: 'hidden',
        shopperEmail: 'readOnly',
        shopperLocale: 'readOnly',
        shopperReference: 'readOnly',
        shopperName: 'hidden',
        countryCode: 'readOnly',
        telephoneNumber: 'readOnly',
        linkValidity: {
            durationUnit: 'readOnly',
            quantity: 'readOnly',
        },
    },
} satisfies PaymentLinkCreationComponentProps['fieldsConfig'];
