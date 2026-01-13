import { PaymentLinksOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PaymentLinksOverviewMeta } from '../components/paymentLinksOverview';
import { PayByLinkOverviewMockedResponses } from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PaymentLinksOverview>> = { ...PaymentLinksOverviewMeta, title: 'Mocked/Pay by Link/Payment Links Overview' };

export const Default: ElementStory<typeof PaymentLinksOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const WithPropsToSubComponents: ElementStory<typeof PaymentLinksOverview> = {
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

export const EmptyList: ElementStory<typeof PaymentLinksOverview> = {
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

export const TooManyStores: ElementStory<typeof PaymentLinksOverview> = {
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

export const StoresMisconfiguration: ElementStory<typeof PaymentLinksOverview> = {
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

export const StoreNetworkError: ElementStory<typeof PaymentLinksOverview> = {
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

export const ErrorFiltersGeneric: ElementStory<typeof PaymentLinksOverview> = {
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
