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

export const EligibleWithOngoingLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible with ongoing - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleWithOngoingLoan,
        },
    },
};

export const EligibleWithOngoingCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible with ongoing - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligibleWithOngoingCashAdvance,
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

export const ErrorOfferLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Offer - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOfferLoan,
        },
    },
};

export const ErrorOfferCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Offer - Cash Advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOfferCashAdvance,
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

export const ErrorReviewLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Review - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorReviewLoan,
        },
    },
};

export const ErrorReviewCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Review - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorReviewCashAdvance,
        },
    },
};

export const ErrorSubmitLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Submit - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorSubmitLoan,
        },
    },
};

export const ErrorSubmitCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Submit - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorSubmitCashAdvance,
        },
    },
};

export const ErrorWithCodeSubmitLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error (with code) - Submit - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorWithCodeSubmitLoan,
        },
    },
};

export const ErrorWithCodeSubmitCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error (with code) - Submit - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorWithCodeSubmitCashAdvance,
        },
    },
};

export const ErrorBalanceAccountLoan: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Balance account - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorBalanceAccountLoan,
        },
    },
};

export const ErrorBalanceAccountCashAdvance: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Balance account - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorBalanceAccountCashAdvance,
        },
    },
};

export default meta;
