import type { Meta } from '@storybook/vue3';
import { paymentLinksOverviewMeta } from './meta';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { payByLinkOverviewMockedResponses } from '../../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    ...paymentLinksOverviewMeta,
    title: 'Mocked/Pay by Link/Payment Links Overview',
};

export const Default: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Default',
    args: {
        mockedApi: true,
        storeIds: ['STORE_NY_001', 'STORE_LON_001', 'STORE_AMS_001'],
    },
};

export const SingleStore: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Single store',
    args: {
        mockedApi: true,
        storeIds: 'STORE_NY_001',
    },
};

export const RestrictedStores: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Restricted stores',
    args: {
        mockedApi: true,
        storeIds: ['STORE_NY_001', 'STORE_LON_001'],
    },
};

export const WrongStoreIds: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Error - Wrong Store IDs',
    args: {
        mockedApi: true,
        storeIds: ['UNKNOWN_STORE'],
    },
};

export const WithPropsToSubComponents: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'With props to sub-components',
    args: {
        mockedApi: true,
        paymentLinkCreation: {
            fieldsConfig: {
                data: {
                    reference: 'Prefilled Merchant Reference',
                },
            },
        },
        paymentLinkSettings: {
            hideTitle: true,
        },
    },
};

export const EmptyList: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Empty List',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...payByLinkOverviewMockedResponses.emptyList,
        },
    },
};

export const TooManyStores: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Error - Too Many Stores',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...payByLinkOverviewMockedResponses.tooManyStores,
        },
    },
};

export const StoresMisconfiguration: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Error - Stores Not Configured',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...payByLinkOverviewMockedResponses.storesMisconfiguration,
        },
    },
};

export const StoreNetworkError: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Error - Stores Network Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...payByLinkOverviewMockedResponses.storeNetworkError,
        },
    },
};

export const ErrorFiltersGeneric: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Error - Filters - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...payByLinkOverviewMockedResponses.filtersNetworkError,
        },
    },
};

export default meta;
