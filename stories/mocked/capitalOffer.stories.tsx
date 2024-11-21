import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const ErrorNoOfferAvailable: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - No config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.noOfferAvailable,
        },
    },
};

export const ErrorNoCapability: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - No capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.errorNoCapability,
        },
    },
};

export const ErrorInactiveAH: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.errorInactiveAccountHolder,
        },
    },
};

export const ErrorExceededRetries: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Generic (after exceeded retries)',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.dynamicOfferExceededRetries,
        },
    },
};

export const ErrorOnDynamicOffer: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Temporary server error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.dynamicOfferServerError,
        },
    },
};

export const ErrorSomethingWentWrong: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Review offer - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.reviewOfferWentWrong,
        },
    },
};

export const ErrorGenericRequestFunds: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.noGrantAccountConfig,
        },
    },
};

export const ErrorNoGrantAccountConfig: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - No grant account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.noGrantAccountConfig,
        },
    },
};

export const ErrorNoPrimaryBalanceAccount: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - No primary balance account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.missingPrimaryBalanceAccount,
        },
    },
};

export default meta;
