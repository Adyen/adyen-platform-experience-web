import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../../src';
import { CapitalOverviewWithSetupMeta } from '../../components/capitalOverview';
import { CapitalOverviewMockedResponses } from '../../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOverview> & SetupControls> = {
    ...CapitalOverviewWithSetupMeta,
    title: 'Mocked/Capital Overview/Grant States',
};

export const GrantPending: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Pending',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantPending,
    },
};

export const GrantActions: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantActions,
    },
};

export const GrantActive: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Active',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantActive,
    },
};

export const GrantFailed: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Failed',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantFailed,
    },
};

export const GrantRepaid: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Repaid',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantRepaid,
    },
};

export const GrantRevoked: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: Revoked',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantRevoked,
    },
};

export const GrantWrittenOff: ElementStory<typeof CapitalOverview> = {
    name: 'Grant: WrittenOff',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: CapitalOverviewMockedResponses.grantWrittenOff,
    },
};

export default meta;
