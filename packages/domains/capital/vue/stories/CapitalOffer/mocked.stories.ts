import type { Meta } from '@storybook/vue3';
import type { CapitalOfferExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { capitalOfferMeta } from './meta';
import { capitalOfferHandlers } from '../../../mocks/mock-server';
import { CapitalOffer } from '@integration-components/capital/preact';

const meta: Meta<ElementProps<CapitalOfferExternalProps>> = {
    ...capitalOfferMeta,
    title: 'Mocked/Capital/Capital Offer',
};

export const UnsupportedRegion: ElementStory<CapitalOfferExternalProps> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.unsupportedRegion,
        },
    },
};

export const Ineligible: ElementStory<CapitalOfferExternalProps> = {
    name: 'Ineligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.ineligible,
        },
    },
};

export const Eligible: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligible,
        },
    },
};

export const EligibleCA: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible CA',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleCA,
        },
    },
};

export const EligibleUS: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleUS,
        },
    },
};

export const EligibleWithOngoingGrants: ElementStory<typeof CapitalOffer> = {
    name: 'Eligible with ongoing grants',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleWithOngoingGrants,
        },
    },
};

export const EarlyRenewal: ElementStory<CapitalOfferExternalProps> = {
    name: 'Early renewal',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.earlyRenewal,
        },
    },
};

export const SingleTerm: ElementStory<CapitalOfferExternalProps> = {
    name: 'Single term',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.singleTerm,
        },
    },
};

export const ErrorOfferConfig: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Offer config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOfferConfig,
        },
    },
};

export const ErrorAccountHolder: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorAccountHolder,
        },
    },
};

export const ErrorOffer: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOffer,
        },
    },
};

export const ErrorTemporaryOffer: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error (temporary) - Offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorTemporaryOffer,
        },
    },
};

export const ErrorReview: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Review',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorReview,
        },
    },
};

export const ErrorSubmit: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Submit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorSubmit,
        },
    },
};

export const ErrorWithCodeSubmit: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error (with code) - Submit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorWithCodeSubmit,
        },
    },
};

export const ErrorBalanceAccount: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Balance account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorBalanceAccount,
        },
    },
};

export default meta;
