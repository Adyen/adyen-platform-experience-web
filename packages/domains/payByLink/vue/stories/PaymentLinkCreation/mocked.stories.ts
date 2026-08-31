import type { Meta } from '@storybook/vue3';
import { PaymentLinkCreationMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { PaymentLinkCreationExternalProps } from '../../src';
import { PayByLinkOverviewMockedResponses, PaymentLinkCreationMockedResponses } from '../../../mocks/mock-server/payByLink';
import { PAYMENT_LINKS_FIELDS_CONFIG } from '../utils/constants/paymentLinks';

const meta: Meta<ElementProps<PaymentLinkCreationExternalProps>> = {
    ...PaymentLinkCreationMeta,
    title: 'Mocked/Pay by Link/Payment Link Creation',
};

const defaultArgs = { mockedApi: true } as const;

export const Default: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Default',
    args: {
        ...defaultArgs,
        storeIds: ['STORE_NY_001', 'STORE_LON_001', 'STORE_AMS_001'],
    },
};

export const Prefilled: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Prefilled',
    args: {
        ...defaultArgs,
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
        storeIds: ['STORE_NY_001'],
    },
};

export const AmbiguousPrefilledPhone: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Ambiguous prefilled phone',
    args: {
        ...defaultArgs,
        fieldsConfig: {
            data: {
                ...PAYMENT_LINKS_FIELDS_CONFIG.data,
                telephoneNumber: '+18684106456',
            },
        },
        storeIds: ['STORE_NY_001'],
    },
};

export const InvalidPrefilledDate: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Invalid prefilled date',
    args: {
        ...defaultArgs,
        fieldsConfig: {
            data: {
                ...PAYMENT_LINKS_FIELDS_CONFIG.data,
                deliverAt: 'invalid-date',
            },
        },
        storeIds: ['STORE_NY_001'],
    },
};

export const WithReadOnlyFields: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'With read-only fields',
    args: {
        ...defaultArgs,
        fieldsConfig: PAYMENT_LINKS_FIELDS_CONFIG,
        storeIds: ['STORE_NY_001'],
    },
};

export const StoresMisconfiguration: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Stores misconfiguration',
    args: defaultArgs,
    parameters: {
        msw: { ...PayByLinkOverviewMockedResponses.storesMisconfiguration },
    },
};

export const StoresNetworkError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Stores Network Error',
    args: defaultArgs,
    parameters: {
        msw: { ...PayByLinkOverviewMockedResponses.storeNetworkError },
    },
};

export const SubmitNetworkError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Submit Network Error',
    args: {
        ...defaultArgs,
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.submitNetworkError },
    },
};

export const SubmitInvalidFieldError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Submit Invalid Field Error',
    args: {
        ...defaultArgs,
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.submitInvalidFields },
    },
};

export const ConfigurationError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Configuration Error',
    args: {
        ...defaultArgs,
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.configError },
    },
};

export const CountryDatasetError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Country Dataset Error',
    args: {
        ...defaultArgs,
        coreOptions: { locale: 'es-ES' },
        storeIds: ['STORE_NY_001'],
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.countryDatasetError },
    },
};

export const CountriesNetworkError: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Countries Network Error',
    args: {
        ...defaultArgs,
        storeIds: ['STORE_NY_001'],
        fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
    },
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.countriesError },
    },
};

export const CreationRoleNotAssigned: ElementStory<PaymentLinkCreationExternalProps> = {
    name: 'Error - Role not assigned',
    args: defaultArgs,
    parameters: {
        msw: { ...PaymentLinkCreationMockedResponses.permissionError },
    },
};

export default meta;
