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
} as const;

export const DEFAULT_GRANTS = [
    {
        id: '66e12a9a64a6',
        grantAmount: {
            value: 2000000,
            currency: 'USD',
        },
        repayedAmount: {
            value: 150000,
            currency: 'USD',
        },
        repaymentPeriodLeft: 118,
        status: 'Pending',
    },
] as const;
