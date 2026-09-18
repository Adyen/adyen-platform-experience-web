import {
    ICapitalState,
    IDynamicOffersConfig,
    IGBCapitalFundsCollection,
    IGrant,
    INLCapitalFundsCollection,
    IOnboardingConfiguration,
    IUSCapitalFundsCollection,
} from '@integration-components/types';

export const REPAYMENT_TERM_QUARTER = 90;
export const REPAYMENT_TERM_HALF = 180;
export const REPAYMENT_TERM_FULL = 360;
export const REPAYMENT_TERMS = [REPAYMENT_TERM_QUARTER, REPAYMENT_TERM_HALF, REPAYMENT_TERM_FULL];

export const DYNAMIC_CAPITAL_OFFER = {
    estimatedRepaymentTermsInDays: REPAYMENT_TERMS,
    minAmount: {
        value: 100000,
        currency: 'EUR',
    },
    maxAmount: {
        value: 2500000,
        currency: 'EUR',
    },
    step: 10000,
} satisfies IDynamicOffersConfig;

export const DEFAULT_GRANT: IGrant = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'EUR',
    },
    totalAmount: {
        value: 2022000,
        currency: 'EUR',
    },
    feesAmount: {
        value: 22000,
        currency: 'EUR',
    },
    remainingGrantAmount: {
        value: 813000,
        currency: 'EUR',
    },
    remainingTotalAmount: {
        value: 2022000,
        currency: 'EUR',
    },
    remainingFeesAmount: {
        value: 9000,
        currency: 'EUR',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'EUR',
    },
    repaidGrantAmount: {
        value: 22000,
        currency: 'EUR',
    },
    repaidTotalAmount: {
        value: 2022000,
        currency: 'EUR',
    },
    thresholdAmount: {
        value: 80000,
        currency: 'EUR',
    },
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 180,
    maximumRepaymentPeriodDays: 270,
    repaymentPeriodLeft: 135,
    termEndsAt: '2025-02-15',
    balanceAccountCode: 'BA1234567',
    balanceAccountDescription: 'Primary balance account',
    status: 'Pending',
    missingActions: [],
    transferInstruments: [{ accountIdentifier: 'NL**INGB******8101' }, { accountIdentifier: 'NL**INGB******4151' }],
    unscheduledRepaymentAccounts: [],
    // revocationAccount: (account here),
};

export const ACTIVE_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: 'afedbe0e05e9',
    repaidTotalAmount: {
        value: 1200000,
        currency: 'EUR',
    },
    repaidGrantAmount: {
        value: 1187000,
        currency: 'EUR',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'EUR',
    },
    status: 'Active',
    remainingTotalAmount: {
        value: 822000,
        currency: 'EUR',
    },
};

export const GRANT_NL_ACCOUNT = {
    beneficiaryName: 'Adyen N.V.',
    iban: 'NL69RABO1319778291',
    region: 'NL',
    order: ['iban', 'beneficiaryName', 'region'],
} satisfies NonNullable<INLCapitalFundsCollection>;

export const GRANT_GB_ACCOUNT = {
    accountNumber: '123456789012',
    beneficiaryName: 'Adyen N.V. London Branch',
    iban: 'GB01ADYB01234567890123',
    region: 'GB',
    sortCode: '012345678',
    order: ['iban', 'accountNumber', 'sortCode', 'beneficiaryName', 'region'],
} satisfies NonNullable<IGBCapitalFundsCollection>;

export const GRANT_US_ACCOUNT = {
    accountNumber: '123456789012',
    beneficiaryName: 'Adyen N.V. San Francisco Branch',
    region: 'US',
    routingNumber: '012345678',
    order: ['accountNumber', 'routingNumber', 'beneficiaryName', 'region'],
} satisfies NonNullable<IUSCapitalFundsCollection>;

export const ACTIVE_GRANT_NL: IGrant = {
    ...ACTIVE_GRANT,
    unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT],
};

export const ACTIVE_GRANT_GB: IGrant = {
    ...ACTIVE_GRANT,
    unscheduledRepaymentAccounts: [GRANT_GB_ACCOUNT],
};

export const ACTIVE_GRANT_US: IGrant = {
    ...ACTIVE_GRANT,
    unscheduledRepaymentAccounts: [GRANT_US_ACCOUNT],
};

export const ACTIVE_GRANT_WITHOUT_TRANSFER_INSTRUMENTS: IGrant = {
    ...ACTIVE_GRANT,
    unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT],
    transferInstruments: [],
};

export const RENEWABLE_GRANT: IGrant = {
    ...ACTIVE_GRANT,
    repaymentRate: 1500,
    expectedRepaymentPeriodDays: 360,
    maximumRepaymentPeriodDays: 450,
    renewal: {
        eligible: true,
        minimumRenewalAmount: {
            value: ACTIVE_GRANT.remainingGrantAmount.value * 1.5,
            currency: 'EUR',
        },
    },
};

export const FAILED_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '6d9d171783ba',
    status: 'Failed',
};

export const PENDING_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '7e18b082372f',
    status: 'Pending',
};

export const PENDING_GRANT_WITH_SINGLE_ACTION: IGrant = {
    ...PENDING_GRANT,
    id: '14588ba8f278',
    offerExpiresAt: '2025-02-15',
    missingActions: [{ type: 'signToS' }],
};

export const PENDING_GRANT_WITH_MULTIPLE_ACTIONS: IGrant = {
    ...PENDING_GRANT,
    id: '14588ba8f278',
    offerExpiresAt: '2025-02-15',
    missingActions: [{ type: 'AnaCredit' }, { type: 'signToS' }],
};

export const REPAID_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: 'e1be2511758c',
    status: 'Repaid',
};

export const REVOKED_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '4d8a8e659b7e',
    status: 'Revoked',
};

export const WRITTEN_OFF_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '1d2c2d289a76',
    status: 'WrittenOff',
};

export const RENEWING_ACTIVE_GRANT: IGrant = { ...ACTIVE_GRANT, renewsGrantId: REPAID_GRANT.id };

export const GRANTS: IGrant[] = [RENEWING_ACTIVE_GRANT, REPAID_GRANT, REVOKED_GRANT, WRITTEN_OFF_GRANT, FAILED_GRANT];

export const SIGNED_OFFER = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'EUR',
    },
    repaidAmount: {
        value: 1200000,
        currency: 'EUR',
    },
    repaidGrantAmount: {
        value: 1187000,
        currency: 'EUR',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'EUR',
    },
    feesAmount: {
        value: 22000,
        currency: 'EUR',
    },
    repaymentAmount: {
        value: 2022000,
        currency: 'EUR',
    },
    thresholdPaymentAmount: {
        value: 80000,
        currency: 'EUR',
    },
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 180,
    maximumRepaymentPeriodDays: 540,
    repaymentPeriodLeft: 135,
    status: 'Pending',
};

export const SIGN_TOS_ACTION_DETAILS = {
    url: 'https://www.adyen.com/',
};

export const ANACREDIT_ACTION_DETAILS = {
    url: 'https://www.adyen.com/capital',
};

export const ONBOARDING_CONFIGURATION: IOnboardingConfiguration = {
    token: 'test-onboarding-token',
    legalEntityId: 'test-legal-entity-id',
};

const CAPITAL_STATE_DEFAULT: ICapitalState = {
    activeOrPendingGrants: [],
    dynamicOffer: DYNAMIC_CAPITAL_OFFER,
    hasClosedGrants: false,
    legalEntity: { region: 'EU' },
};

export const CAPITAL_STATE_UNSUPPORTED_REGION: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    legalEntity: { region: 'TR' },
};

export const CAPITAL_STATE_INELIGIBLE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    dynamicOffer: undefined,
};

export const CAPITAL_STATE_FIRST_OFFER: ICapitalState = CAPITAL_STATE_DEFAULT;

export const CAPITAL_STATE_SINGLE_TERM: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    dynamicOffer: {
        ...DYNAMIC_CAPITAL_OFFER,
        estimatedRepaymentTermsInDays: [REPAYMENT_TERM_HALF],
    },
    hasClosedGrants: true,
};

export const CAPITAL_STATE_CA: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    dynamicOffer: {
        ...DYNAMIC_CAPITAL_OFFER,
        minAmount: {
            ...DYNAMIC_CAPITAL_OFFER.minAmount,
            currency: 'CAD',
        },
        maxAmount: {
            ...DYNAMIC_CAPITAL_OFFER.maxAmount,
            currency: 'CAD',
        },
    },
    legalEntity: { region: 'CA' },
};

export const CAPITAL_STATE_US: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    legalEntity: { region: 'US' },
};

export const CAPITAL_STATE_ACTIVE_GRANT: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [ACTIVE_GRANT],
};

export const CAPITAL_STATE_RENEWABLE_GRANT: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [RENEWABLE_GRANT],
};

export const CAPITAL_STATE_PENDING_GRANT: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [PENDING_GRANT],
};

export const CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [PENDING_GRANT_WITH_SINGLE_ACTION],
};

export const CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS],
};

export const CAPITAL_STATE_GRANTS: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    activeOrPendingGrants: [RENEWING_ACTIVE_GRANT],
    hasClosedGrants: true,
};

export const CAPITAL_STATE_CLOSED_GRANTS: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT,
    hasClosedGrants: true,
};
