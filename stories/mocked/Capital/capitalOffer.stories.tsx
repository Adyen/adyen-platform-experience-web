import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { capitalOfferWithSetupMeta } from '../../components/Capital/capitalOffer';
import { CapitalOffer, CapitalOverview, ILegalEntity } from '../../../src';
import { CapitalOfferMockedResponses } from '../../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = { ...capitalOfferWithSetupMeta, title: 'Mocked/Capital/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.default,
        },
    },
};

export const UnsupportedRegion: ElementStory<typeof CapitalOverview, { mountIfInUnsupportedRegion: boolean; legalEntity: ILegalEntity }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
        legalEntity: {
            countryCode: 'TR',
            regions: [{ type: 'capital', value: 'Middle East' }],
        },
    },
};

export const WithAPRField: ElementStory<typeof CapitalOffer, { legalEntity: ILegalEntity }> = {
    name: 'With APR field',
    args: {
        mockedApi: true,
        legalEntity: {
            countryCode: 'CA',
            regions: [],
        },
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.aprField,
        },
    },
};

export const ErrorDynamicOfferConfigNoConfig: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - No config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferConfigNoConfig,
        },
    },
};

export const ErrorDynamicOfferConfigNoCapability: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - No capability',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferConfigNoCapability,
        },
    },
};

export const ErrorDynamicOfferConfigInactiveAccountHolder: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer config - Inactive account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferConfigInactiveAccountHolder,
        },
    },
};

export const ErrorDynamicOfferExceededRetries: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Exceeded retries',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferExceededRetries,
        },
    },
};

export const ErrorDynamicOfferTemporary: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Dynamic offer - Temporary',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorDynamicOfferTemporary,
        },
    },
};

export const ErrorReviewOfferGeneric: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Review offer - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorReviewOfferGeneric,
        },
    },
};

export const ErrorRequestFundsGeneric: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - Generic',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsGeneric,
        },
    },
};

export const ErrorRequestFundsGenericWithCode: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - Generic with code',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsGenericWithCode,
        },
    },
};

export const ErrorRequestFundsNoPrimaryBalanceAccount: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Request funds - No primary balance account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.errorRequestFundsNoPrimaryBalanceAccount,
        },
    },
};

export default meta;
