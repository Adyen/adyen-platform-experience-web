import type { ContractTypeKeyMap } from './utils';

export const CAPITAL_REPAYMENT_FREQUENCY = 30;

export const SHARED_CONTRACT_KEYS = {
    dailyRepaymentRate: {
        CashAdvance: 'capital.common.fields.cashAdvance.dailyRepaymentRate.label',
        Loan: 'capital.common.fields.loan.dailyRepaymentRate.label',
    },
    expectedRepaymentPeriod: {
        CashAdvance: 'capital.common.fields.cashAdvance.expectedRepaymentPeriod.label',
        Loan: 'capital.common.fields.loan.expectedRepaymentPeriod.label',
    },
    expectedRepaymentPeriodDescription: {
        CashAdvance: 'capital.common.fields.cashAdvance.expectedRepaymentPeriod.description',
        Loan: undefined,
    },
    financing: {
        CashAdvance: 'capital.common.fields.cashAdvance.financing.label',
        Loan: 'capital.common.fields.loan.financing.label',
    },
    grantId: {
        CashAdvance: 'capital.common.fields.cashAdvance.grantID.label',
        Loan: 'capital.common.fields.loan.grantID.label',
    },
    newGrantAmount: {
        CashAdvance: 'capital.offer.cashAdvance.newGrantAmount',
        Loan: 'capital.offer.loan.newGrantAmount',
    },
    regulatoryNotice: {
        CashAdvance: 'capital.offer.cashAdvance.regulatoryNotice.GB',
        Loan: undefined,
    },
    repaymentThreshold: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.repaymentThreshold.label',
    },
    repaymentThresholdDescription: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.repaymentThreshold.description',
    },
    termsTitle: {
        CashAdvance: 'capital.offer.cashAdvance.termsTitle',
        Loan: 'capital.offer.loan.termsTitle',
    },
    totalRepaymentAmount: {
        CashAdvance: 'capital.common.fields.cashAdvance.totalRepaymentAmount.label',
        Loan: 'capital.common.fields.loan.totalRepaymentAmount.label',
    },
} satisfies ContractTypeKeyMap;
