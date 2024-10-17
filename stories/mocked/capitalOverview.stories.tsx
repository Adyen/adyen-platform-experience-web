import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Mocked/Capital Overview' };

export const WithCallbacks: ElementStory<typeof CapitalOverview> = {
    name: 'With callbacks',
    args: {
        mockedApi: true,
        onRequestFunds: (data, goToNextStep) => {
            alert(`Amount requested: ${data.grantAmount.value}`);
            goToNextStep();
        },
        onSeeOptions(goToNextStep) {
            alert('Are you sure?');
            goToNextStep();
        },
        onOfferDismissed: goToPreviousStep => {
            alert('Offer dismissed');
            goToPreviousStep();
        },
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.prequalified,
        },
    },
};

export const PreQualified: ElementStory<typeof CapitalOverview> = {
    name: 'Pre-qualified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.prequalified,
        },
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

export const Unqualified: ElementStory<typeof CapitalOverview> = {
    name: 'Unqualified',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.unqualified,
        },
    },
};

export const ErrorNoCapability: ElementStory<typeof CapitalOverview> = {
    name: 'Error - No capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.errorNoCapability,
        },
    },
};
export const ErrorInactiveAH: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Inactive Account Holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.errorInactiveAccountHolder,
        },
    },
};

export default meta;
