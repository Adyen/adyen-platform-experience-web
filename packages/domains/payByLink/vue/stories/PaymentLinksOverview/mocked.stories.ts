import type { Meta } from '@storybook/vue3';
import { paymentLinksOverviewMeta } from './meta';
import type { PaymentLinksOverviewComponentProps, PaymentLinksOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { payByLinkOverviewMockedResponses } from '../../../mocks/mock-server/payByLink';
import { PAYMENT_LINKS_FIELDS_CONFIG } from '../utils/constants/paymentLinks';

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

export const PrefilledCreation: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Prefilled creation',
    args: {
        mockedApi: true,
        storeIds: 'STORE_NY_001',
        paymentLinkCreation: {
            fieldsConfig: { data: PAYMENT_LINKS_FIELDS_CONFIG.data },
        },
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

type SubComponentConfigProps = Pick<PaymentLinksOverviewComponentProps, 'paymentLinkCreation'>;

export const WithPropsToSubComponents: ElementStory<PaymentLinksOverviewExternalProps, SubComponentConfigProps> = {
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
