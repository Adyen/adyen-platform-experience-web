import { IDynamicOfferConfig, IGrantOffer } from '../../src';

export const DYNAMIC_CAPITAL_OFFER = {
    minAmount: {
        value: 100000,
        currency: 'USD',
    },
    maxAmount: {
        value: 2500000,
        currency: 'USD',
    },
    step: 10000,
} satisfies IDynamicOfferConfig;

export const DEFAULT_GRANTS = [
    {
        id: '66e12a9a64a6',
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
        status: 'Pending',
    },
] satisfies IGrantOffer[];
