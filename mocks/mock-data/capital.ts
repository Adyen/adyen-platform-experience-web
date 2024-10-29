import { IDynamicOfferConfig, IGrant } from '../../src';

export const DYNAMIC_CAPITAL_OFFER = {
    minAmount: {
        value: 100000,
        currency: 'EUR',
    },
    maxAmount: {
        value: 2500000,
        currency: 'EUR',
    },
    step: 10000,
} satisfies IDynamicOfferConfig;

export const DEFAULT_GRANT: IGrant = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'USD',
    },
    totalAmount: {
        value: 2022000,
        currency: 'USD',
    },
    feesAmount: {
        value: 22000,
        currency: 'USD',
    },
    remainingGrantAmount: {
        value: 813000,
        currency: 'USD',
    },
    remainingTotalAmount: {
        value: 2022000,
        currency: 'USD',
    },
    remainingFeesAmount: {
        value: 9000,
        currency: 'USD',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'USD',
    },
    repaidGrantAmount: {
        value: 22000,
        currency: 'USD',
    },
    repaidTotalAmount: {
        value: 2022000,
        currency: 'USD',
    },
    thresholdAmount: {
        value: 80000,
        currency: 'USD',
    },
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
    repaymentPeriodLeft: 135,
    termEndsAt: '2025-02-15',
    balanceAccountCode: 'BA1234567',
    balanceAccountDescription: 'Primary balance account',
    status: 'Pending',
    missingActions: [],
};

export const ACTIVE_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: 'afedbe0e05e9',
    repaidTotalAmount: {
        value: 1200000,
        currency: 'USD',
    },
    repaidGrantAmount: {
        value: 1187000,
        currency: 'USD',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'USD',
    },
    status: 'Active',
    remainingTotalAmount: {
        value: 822000,
        currency: 'USD',
    },
};

export const ACTIVE_UNREPAID_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '923f6376c6f2',
    repaidTotalAmount: {
        value: 0,
        currency: 'USD',
    },
    repaidGrantAmount: {
        value: 0,
        currency: 'USD',
    },
    repaidFeesAmount: {
        value: 0,
        currency: 'USD',
    },
    status: 'Active',
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

export const PENDING_GRANT_WITH_ACTIONS: IGrant = {
    ...PENDING_GRANT,
    id: '14588ba8f278',
    offerExpiresAt: '2025-02-15',
    missingActions: [
        {
            type: 'signToS',
            url: 'url',
        },
    ],
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

export const GRANT_OFFER = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'USD',
    },
    feesAmount: {
        value: 22000,
        currency: 'USD',
    },
    totalAmount: {
        value: 2022000,
        currency: 'USD',
    },
    thresholdAmount: {
        value: 169000,
        currency: 'USD',
    },
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
};

export const OFFER_REVIEW = GRANT_OFFER;

export const SIGNED_OFFER = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'USD',
    },
    repaidAmount: {
        value: 1200000,
        currency: 'USD',
    },
    repaidGrantAmount: {
        value: 1187000,
        currency: 'USD',
    },
    repaidFeesAmount: {
        value: 13000,
        currency: 'USD',
    },
    feesAmount: {
        value: 22000,
        currency: 'USD',
    },
    repaymentAmount: {
        value: 2022000,
        currency: 'USD',
    },
    thresholdPaymentAmount: {
        value: 80000,
        currency: 'USD',
    },
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
    repaymentPeriodLeft: 135,
    status: 'Pending',
};
