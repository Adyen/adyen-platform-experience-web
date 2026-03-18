import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PaymentLinkCreationMeta } from '../components/paymentLinkCreation';
import { PayByLinkOverviewMockedResponses, PaymentLinkCreationMockedResponses } from '../../mocks/mock-server/payByLink';
import { action } from 'storybook/actions';
import { PAYMENT_LINKS_FIELDS_CONFIG } from './utils/constants/paymentLinks';

const meta: Meta<ElementProps<typeof PaymentLinkCreation>> = { ...PaymentLinkCreationMeta, title: 'Mocked/Pay by Link/Payment Link Creation' };

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
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        onCreationDismiss: action('Creation dismissed'),
        storeIds: ['STORE_NY_001'],
    },
};

export const WithReadOnlyFields: ElementStory<typeof PaymentLinkCreation> = {
    name: 'With read-only fields',
    args: {
        fieldsConfig: PAYMENT_LINKS_FIELDS_CONFIG,
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
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
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
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.submitInvalidFields,
        },
    },
};

export const ConfigurationError: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Error - Configuration Error',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.configError,
        },
    },
};

export const CountryDatasetError: ElementStory<typeof PaymentLinkCreation> = {
    name: 'Error - Country Dataset Error',
    args: {
        mockedApi: true,
        coreOptions: {
            locale: 'es-ES',
        },
        onPaymentLinkCreated: action('Payment link created'),
        storeIds: ['STORE_NY_001'],
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: {
            ...PaymentLinkCreationMockedResponses.countryDatasetError,
        },
    },
};

export default meta;
