import type { Meta } from '@storybook/vue3';
import { PaymentLinksOverviewMeta } from './meta';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayByLinkOverviewMockedResponses } from '../../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    ...PaymentLinksOverviewMeta,
    title: 'Mocked/Pay by Link/Payment Links Overview',
};

export const Default: ElementStory<PaymentLinksOverviewExternalProps> = {
    name: 'Default',
    args: {
        mockedApi: true,
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
            ...PayByLinkOverviewMockedResponses.emptyList,
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
            ...PayByLinkOverviewMockedResponses.tooManyStores,
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
            ...PayByLinkOverviewMockedResponses.storesMisconfiguration,
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
            ...PayByLinkOverviewMockedResponses.storeNetworkError,
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
            ...PayByLinkOverviewMockedResponses.filtersNetworkError,
        },
    },
};

export default meta;
