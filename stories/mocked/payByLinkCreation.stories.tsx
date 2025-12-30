import { Meta } from '@storybook/preact';
import { PayByLinkCreation } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkCreationMeta } from '../components/payByLinkCreation';
import { action } from '@storybook/addon-actions';
import { PayByLinkCreationComponentProps } from '../../src/components/types';
import { PayByLinkOverviewMockedResponses, PaymentLinkCreationMockedResponses } from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PayByLinkCreation>> = { ...PayByLinkCreationMeta, title: 'Mocked/Pay by link Creation' };

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
} satisfies PayByLinkCreationComponentProps['fieldsConfig'];

export const Default: ElementStory<typeof PayByLinkCreation> = {
    name: 'Default',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        onCreationDismiss: action('Creation dismissed'),
        storeIds: ['STORE_NY_001', 'STORE_LON_001', 'STORE_AMS_001'],
    },
};

export const Prefilled: ElementStory<typeof PayByLinkCreation> = {
    name: 'Prefilled',
    args: {
        fieldsConfig,
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        onCreationDismiss: action('Creation dismissed'),
        storeIds: ['STORE_NY_001'],
    },
};

export const StoresMisconfiguration: ElementStory<typeof PayByLinkCreation> = {
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

export const SubmitNetworkError: ElementStory<typeof PayByLinkCreation> = {
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

export const SubmitInvalidFieldError: ElementStory<typeof PayByLinkCreation> = {
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

export const ConfigurationError: ElementStory<typeof PayByLinkCreation> = {
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
