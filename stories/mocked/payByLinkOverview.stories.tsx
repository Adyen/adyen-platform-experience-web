import { PayByLinkOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayByLinkOverviewMeta } from '../components/payByLinkOverview';
import { PayByLinkOverviewMockedResponses } from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PayByLinkOverview>> = { ...PayByLinkOverviewMeta, title: 'Mocked/Pay By Link Overview' };

export const Default: ElementStory<typeof PayByLinkOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const WithPropsToSubComponents: ElementStory<typeof PayByLinkOverview> = {
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

export const EmptyList: ElementStory<typeof PayByLinkOverview> = {
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

export const FilterError: ElementStory<typeof PayByLinkOverview> = {
    name: 'Filter Error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...PayByLinkOverviewMockedResponses.filterError,
        },
    },
};

export const TooManyStores: ElementStory<typeof PayByLinkOverview> = {
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

export const StoresMisconfiguration: ElementStory<typeof PayByLinkOverview> = {
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

export const StoreNetworkError: ElementStory<typeof PayByLinkOverview> = {
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

export const ErrorFiltersGeneric: ElementStory<typeof PayByLinkOverview> = {
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
