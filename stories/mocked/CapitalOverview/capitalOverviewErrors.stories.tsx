import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../../src';
import { CapitalOverviewWithSetupMeta } from '../../components/capitalOverview';
import { CapitalOverviewMockedResponses } from '../../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOverview> & SetupControls> = { ...CapitalOverviewWithSetupMeta, title: 'Mocked/Capital Overview/Errors' };

export const ErrorNoCapability: ElementStory<typeof CapitalOverview> = {
    name: `Error - Dynamic offer config - No capability`,
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorDynamicOfferConfigNoCapability,
        },
    },
};

export const ErrorInactiveAH: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Dynamic offer config - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorDynamicOfferConfigInactiveAccountHolder,
        },
    },
};

export const ErrorMissingActions: ElementStory<typeof CapitalOverview> = {
    name: 'Error - Missing actions - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOverviewMockedResponses.errorMissingActionsGeneric,
        },
    },
};

export default meta;
