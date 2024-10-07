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
    id: '16700c6d53ed',
    grantAmount: {
        value: 2000000,
        currency: 'USD',
    },
    repayedAmount: {
        value: 1200000,
        currency: 'USD',
    },
    repayedGrantAmount: {
        value: 1187000,
        currency: 'USD',
    },
    repayedFeesAmount: {
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
    repaymentRate: 11,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
    repaymentPeriodLeft: 135,
    status: 'Active',
};

export const ACTIVE_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: 'afedbe0e05e9',
    repayedAmount: {
        value: 1200000,
        currency: 'USD',
    },
    repayedGrantAmount: {
        value: 1187000,
        currency: 'USD',
    },
    repayedFeesAmount: {
        value: 13000,
        currency: 'USD',
    },
    status: 'Active',
};

export const ACTIVE_UNREPAID_GRANT: IGrant = {
    ...DEFAULT_GRANT,
    id: '923f6376c6f2',
    repayedAmount: {
        value: 0,
        currency: 'USD',
    },
    repayedGrantAmount: {
        value: 0,
        currency: 'USD',
    },
    repayedFeesAmount: {
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
    repaymentRate: 11,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
};

export const OFFER_REVIEW = {
    id: '66e12a9a64a6',
    grantAmount: {
        value: 2000000,
        currency: 'EUR',
    },
    feesAmount: {
        value: 22000,
        currency: 'EUR',
    },
    totalAmount: {
        value: 2022000,
        currency: 'EUR',
    },
    thresholdAmount: {
        value: 169000,
        currency: 'EUR',

    },
    repaymentRate: 11,
    expectedRepaymentPeriodDays: 365,
    maximumRepaymentPeriodDays: 540,
};
