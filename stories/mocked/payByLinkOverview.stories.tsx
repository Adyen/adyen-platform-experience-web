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

export const EmptyStores: ElementStory<typeof PayByLinkOverview> = {
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

export default meta;
