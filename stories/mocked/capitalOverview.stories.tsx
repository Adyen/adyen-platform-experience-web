import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Mocked/Capital Overview' };

export const Basic: ElementStory<typeof CapitalOverview> = {
    name: 'Basic',
    args: {
        mockedApi: true,
    },
};

export const WithActiveGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Active Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.activeGrant,
    },
};

export const WithActiveUnrepaidGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Active Unrepaid Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.activeUnrepaidGrant,
    },
};

export const WithFailedGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Failed Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.failedGrant,
    },
};

export const WithPendingGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Pending Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.pendingGrant,
    },
};

export const WithRepaidGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Repaid Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.repaidGrant,
    },
};

export const WithRevokedGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Revoked Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.revokedGrant,
    },
};

export const WithWrittenOffGrant: ElementStory<typeof CapitalOverview> = {
    name: 'With Written Off Grant',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalMockedResponses.writtenOffGrant,
    },
};

export default meta;
