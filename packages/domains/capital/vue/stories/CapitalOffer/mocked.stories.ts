import type { Meta } from '@storybook/vue3';
import type { CapitalOfferExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { CapitalOfferMeta } from './meta';
import { capitalOfferHandlers } from '../../../mocks/mock-server';

const meta: Meta<ElementProps<CapitalOfferExternalProps>> = {
    ...CapitalOfferMeta,
    title: 'Mocked/Capital/Capital Offer',
};

export const UnsupportedRegion: ElementStory<CapitalOfferExternalProps> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        onContactSupport: 'Enabled',
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

export const EligibleWithOngoing: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible with ongoing',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleWithOngoing,
        },
    },
};

export const EligibleLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleLoan,
        },
    },
};

export const EligibleCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleCashAdvance,
        },
    },
};

export const EligibleUnsupportedContract: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible - Unsupported contract',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleUnsupportedContract,
        },
    },
};

export const SingleTermLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Single term - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.singleTermLoan,
        },
    },
};

export const SingleTermCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Single term - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.singleTermCashAdvance,
        },
    },
};

export const EligibleCALoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible CA - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleCALoan,
        },
    },
};

export const EligibleUSLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible US - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleUSLoan,
        },
    },
};

export const EarlyRenewalLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Early renewal - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.earlyRenewalLoan,
        },
    },
};

export const EarlyRenewalCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Early renewal - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.earlyRenewalCashAdvance,
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

export const ErrorSubmitLoan: ElementStory<CapitalOfferExternalProps> = {
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
