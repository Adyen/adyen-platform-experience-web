import { IDynamicOfferConfig, IGrant } from '../../src';

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

const GRANTS = [
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
    {
        id: '88d24b1k23a9',
        grantAmount: {
            value: 1800000,
            currency: 'USD',
        },
        repayedAmount: {
            value: 1200000,
            currency: 'USD',
        },
        repayedGrantAmount: {
            value: 987000,
            currency: 'USD',
        },
        repayedFeesAmount: {
            value: 18000,
            currency: 'USD',
        },
        feesAmount: {
            value: 22000,
            currency: 'USD',
        },
        repaymentAmount: {
            value: 3010000,
            currency: 'USD',
        },
        thresholdPaymentAmount: {
            value: 90000,
            currency: 'USD',
        },

        repaymentRate: 15,
        expectedRepaymentPeriodDays: 400,
        maximumRepaymentPeriodDays: 600,
        repaymentPeriodLeft: 210,
        status: 'Pending',
    },
] as const;

export const SINGLE_GRANT = [GRANTS[0]] satisfies IGrant[];
