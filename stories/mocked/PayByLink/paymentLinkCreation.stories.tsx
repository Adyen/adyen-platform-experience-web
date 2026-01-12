import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../../src';
import { ElementProps, ElementStory } from '../../utils/types';
import { PaymentLinkCreationMeta } from '../../components/PayByLink/paymentLinkCreation';
import { PaymentLinkCreationComponentProps } from '../../../src/components/types';
import { PayByLinkOverviewMockedResponses, PaymentLinkCreationMockedResponses } from '../../../mocks/mock-server/payByLink';
import { action } from 'storybook/actions';

const meta: Meta<ElementProps<typeof PaymentLinkCreation>> = { ...PaymentLinkCreationMeta, title: 'Mocked/Pay by Link/Payment Link Creation' };

const fieldsConfig = {
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
} satisfies PaymentLinkCreationComponentProps['fieldsConfig'];

export const Default: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Default',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        onCreationDismiss: action('Creation dismissed'),
        storeIds: ['STORE_NY_001', 'STORE_LON_001', 'STORE_AMS_001'],
    },
};

export const Prefilled: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Prefilled',
    args: {
        fieldsConfig,
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        onCreationDismiss: action('Creation dismissed'),
        storeIds: ['STORE_NY_001'],
    },
};

export const StoresMisconfiguration: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Stores misconfiguration',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
    },
    parameters: {
        msw: {
            ...PayByLinkOverviewMockedResponses.storesMisconfiguration,
        },
    },
};

export const SubmitNetworkError: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Error - Submit Network Error',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        fieldsConfig,
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.submitNetworkError,
        },
    },
};

export const SubmitInvalidFieldError: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Error - Submit Invalid Field Error',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        fieldsConfig,
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.submitInvalidFields,
        },
    },
};

export const ConfigurationError: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Error -Configuration Error',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        fieldsConfig,
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.configError,
        },
    },
};

export default meta;
