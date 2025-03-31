import { IDynamicOffersConfig, IGrant } from '../../src';

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
} satisfies IDynamicOffersConfig;

export const GRANT_US_ACCOUNT = {
    region: 'US',
    accountNumber: '123456789012',
    routingNumber: '012345678',
    order: ['accountNumber', 'routingNumber', 'region'],
} satisfies NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];

export const GRANT_GB_ACCOUNT = {
    region: 'GB',
    accountNumber: '123456789012',
    iban: 'GB01ADYB01234567890123',
    sortCode: '012345678',
    order: ['iban', 'accountNumber', 'sortCode', 'region'],
} satisfies NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];

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
    maximumRepaymentPeriodDays: 540,
    repaymentPeriodLeft: 135,
    termEndsAt: '2025-02-15',
    balanceAccountCode: 'BA1234567',
    balanceAccountDescription: 'Primary balance account',
    status: 'Pending',
    missingActions: [],
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
    missingActions: [{ type: 'signToS' }],
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

export const GRANTS: IGrant[] = [ACTIVE_GRANT, REPAID_GRANT, REVOKED_GRANT, WRITTEN_OFF_GRANT, FAILED_GRANT];

export const GRANT_OFFER = {
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
    repaymentRate: 1100,
    expectedRepaymentPeriodDays: 180,
    maximumRepaymentPeriodDays: 540,
};

export const OFFER_REVIEW = GRANT_OFFER;

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
