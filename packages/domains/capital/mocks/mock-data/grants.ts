import { IGBCapitalFundsCollection, IGrant, INLCapitalFundsCollection, IUSCapitalFundsCollection } from '@integration-components/types';

export const REPAYMENT_ACCOUNT_NL = {
    beneficiaryName: 'Adyen N.V.',
    iban: 'NL69RABO1319778291',
    region: 'NL',
    order: ['iban', 'beneficiaryName', 'region'],
} satisfies NonNullable<INLCapitalFundsCollection>;

export const REPAYMENT_ACCOUNT_GB = {
    accountNumber: '123456789012',
    beneficiaryName: 'Adyen N.V. London Branch',
    iban: 'GB01ADYB01234567890123',
    region: 'GB',
    sortCode: '012345678',
    order: ['iban', 'accountNumber', 'sortCode', 'beneficiaryName', 'region'],
} satisfies NonNullable<IGBCapitalFundsCollection>;

export const REPAYMENT_ACCOUNT_US = {
    accountNumber: '123456789012',
    beneficiaryName: 'Adyen N.V. San Francisco Branch',
    region: 'US',
    routingNumber: '012345678',
    order: ['accountNumber', 'routingNumber', 'beneficiaryName', 'region'],
} satisfies NonNullable<IUSCapitalFundsCollection>;

export const DEFAULT_LOAN: IGrant = {
    balanceAccountCode: 'BA1234567',
    balanceAccountDescription: 'Primary balance account',
    contractType: 'Loan',
    expectedRepaymentPeriodDays: 180,
    feesAmount: { value: 22000, currency: 'EUR' },
    grantAmount: { value: 2000000, currency: 'EUR' },
    id: '66e12a9a64a6',
    maximumRepaymentPeriodDays: 270,
    missingActions: [],
    offerExpiresAt: '2025-02-15',
    remainingFeesAmount: { value: 9000, currency: 'EUR' },
    remainingGrantAmount: { value: 813000, currency: 'EUR' },
    remainingTotalAmount: { value: 2022000, currency: 'EUR' },
    repaidFeesAmount: { value: 13000, currency: 'EUR' },
    repaidGrantAmount: { value: 22000, currency: 'EUR' },
    repaidTotalAmount: { value: 2022000, currency: 'EUR' },
    repaymentPeriodLeft: 135,
    repaymentRate: 1100,
    status: 'Pending',
    termEndsAt: '2025-02-15',
    thresholdAmount: { value: 80000, currency: 'EUR' },
    totalAmount: { value: 2022000, currency: 'EUR' },
};

export const DEFAULT_CASH_ADVANCE: IGrant = {
    ...DEFAULT_LOAN,
    contractType: 'CashAdvance',
    feesAmount: { value: 22000, currency: 'GBP' },
    grantAmount: { value: 2000000, currency: 'GBP' },
    remainingFeesAmount: { value: 9000, currency: 'GBP' },
    remainingGrantAmount: { value: 813000, currency: 'GBP' },
    remainingTotalAmount: { value: 2022000, currency: 'GBP' },
    repaidFeesAmount: { value: 13000, currency: 'GBP' },
    repaidGrantAmount: { value: 22000, currency: 'GBP' },
    repaidTotalAmount: { value: 2022000, currency: 'GBP' },
    thresholdAmount: { value: 80000, currency: 'GBP' },
    totalAmount: { value: 2022000, currency: 'GBP' },
};

export const PENDING_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    status: 'Pending',
};

export const PENDING_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    status: 'Pending',
};

export const ACTIONS_LOAN: IGrant = {
    ...PENDING_LOAN,
    missingActions: [{ type: 'AnaCredit' }, { type: 'signToS' }],
};

export const ACTIONS_CASH_ADVANCE: IGrant = {
    ...PENDING_CASH_ADVANCE,
    missingActions: [{ type: 'AnaCredit' }, { type: 'signToS' }],
};

export const SINGLE_ACTION_LOAN: IGrant = {
    ...PENDING_LOAN,
    missingActions: [{ type: 'signToS' }],
};

export const SINGLE_ACTION_CASH_ADVANCE: IGrant = {
    ...PENDING_CASH_ADVANCE,
    missingActions: [{ type: 'signToS' }],
};

export const ACTIVE_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    id: 'afedbe0e05e9',
    remainingTotalAmount: { value: 822000, currency: 'EUR' },
    repaidTotalAmount: { value: 1200000, currency: 'EUR' },
    repaidGrantAmount: { value: 1187000, currency: 'EUR' },
    repaidFeesAmount: { value: 13000, currency: 'EUR' },
    status: 'Active',
    transferInstruments: [{ accountIdentifier: 'NL**INGB******8101' }, { accountIdentifier: 'NL**INGB******4151' }],
    unscheduledRepaymentAccounts: [REPAYMENT_ACCOUNT_NL],
};

export const ACTIVE_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    id: 'afedbe0e05e9',
    remainingTotalAmount: { value: 822000, currency: 'GBP' },
    repaidTotalAmount: { value: 1200000, currency: 'GBP' },
    repaidGrantAmount: { value: 1187000, currency: 'GBP' },
    repaidFeesAmount: { value: 13000, currency: 'GBP' },
    status: 'Active',
    transferInstruments: [{ accountIdentifier: 'GB**ADYB**********0123' }, { accountIdentifier: 'GB**ADYB**********4151' }],
    unscheduledRepaymentAccounts: [REPAYMENT_ACCOUNT_GB],
};

export const ACTIVE_REPAYMENT_US: IGrant = {
    ...ACTIVE_LOAN,
    transferInstruments: [{ accountIdentifier: '****8101' }, { accountIdentifier: '****4151' }],
    unscheduledRepaymentAccounts: [REPAYMENT_ACCOUNT_US],
};

export const ACTIVE_WITHOUT_TRANSFER_INSTRUMENTS: IGrant = {
    ...ACTIVE_LOAN,
    transferInstruments: [],
};

export const ACTIVE_WITHOUT_REPAYMENT_ACCOUNT: IGrant = {
    ...ACTIVE_LOAN,
    unscheduledRepaymentAccounts: [],
};

export const RENEWABLE_LOAN: IGrant = {
    ...ACTIVE_LOAN,
    repaymentRate: 1500,
    expectedRepaymentPeriodDays: 360,
    maximumRepaymentPeriodDays: 450,
    renewal: {
        eligible: true,
        minimumRenewalAmount: {
            value: ACTIVE_LOAN.remainingGrantAmount.value * 1.5,
            currency: 'EUR',
        },
    },
};

export const RENEWABLE_CASH_ADVANCE: IGrant = {
    ...ACTIVE_CASH_ADVANCE,
    repaymentRate: 1500,
    expectedRepaymentPeriodDays: 360,
    maximumRepaymentPeriodDays: 450,
    renewal: {
        eligible: true,
        minimumRenewalAmount: {
            value: ACTIVE_CASH_ADVANCE.remainingGrantAmount.value * 1.5,
            currency: 'GBP',
        },
    },
};

export const REPAID_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    id: 'e1be2511758c',
    status: 'Repaid',
};

export const REPAID_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    id: 'e1be2511758c',
    status: 'Repaid',
};

export const FAILED_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    id: '6d9d171783ba',
    status: 'Failed',
};

export const FAILED_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    id: '6d9d171783ba',
    status: 'Failed',
};

export const REVOKED_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    id: '4d8a8e659b7e',
    status: 'Revoked',
};

export const REVOKED_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    id: '4d8a8e659b7e',
    status: 'Revoked',
};

export const WRITTEN_OFF_LOAN: IGrant = {
    ...DEFAULT_LOAN,
    id: '1d2c2d289a76',
    status: 'WrittenOff',
};

export const WRITTEN_OFF_CASH_ADVANCE: IGrant = {
    ...DEFAULT_CASH_ADVANCE,
    id: '1d2c2d289a76',
    status: 'WrittenOff',
};

export const RENEWING_ACTIVE_LOAN: IGrant = {
    ...ACTIVE_LOAN,
    renewsGrantId: REPAID_LOAN.id,
};

export const RENEWING_ACTIVE_CASH_ADVANCE: IGrant = {
    ...ACTIVE_CASH_ADVANCE,
    renewsGrantId: REPAID_CASH_ADVANCE.id,
};

export const GRANTS_LOAN: IGrant[] = [RENEWING_ACTIVE_LOAN, REPAID_LOAN, REVOKED_LOAN, WRITTEN_OFF_LOAN, FAILED_LOAN];

export const GRANTS_CASH_ADVANCE: IGrant[] = [
    RENEWING_ACTIVE_CASH_ADVANCE,
    REPAID_CASH_ADVANCE,
    FAILED_CASH_ADVANCE,
    REVOKED_CASH_ADVANCE,
    WRITTEN_OFF_CASH_ADVANCE,
];

export const SIGNED_OFFER_LOAN: IGrant = PENDING_LOAN;
export const SIGNED_OFFER_CASH_ADVANCE: IGrant = PENDING_CASH_ADVANCE;
