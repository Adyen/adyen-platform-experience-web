import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    maximumRepaymentPeriod: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.maximumRepaymentPeriod.label',
    },
    remainingAmount: {
        CashAdvance: 'capital.common.fields.cashAdvance.remainingAmount.label',
        Loan: 'capital.common.fields.loan.remainingAmount.label',
    },
    remainingFees: {
        CashAdvance: 'capital.common.fields.cashAdvance.remainingFees.label',
        Loan: 'capital.common.fields.loan.remainingFees.label',
    },
    repaidAmount: {
        CashAdvance: 'capital.common.fields.cashAdvance.repaidAmount.label',
        Loan: 'capital.common.fields.loan.repaidAmount.label',
    },
    repaidFees: {
        CashAdvance: 'capital.common.fields.cashAdvance.repaidFees.label',
        Loan: 'capital.common.fields.loan.repaidFees.label',
    },
    requestedFunds: {
        CashAdvance: 'capital.overview.grantItem.cashAdvance.requestedFunds',
        Loan: 'capital.overview.grantItem.loan.requestedFunds',
    },
    totalFees: {
        CashAdvance: 'capital.common.fields.cashAdvance.totalFees.label',
        Loan: 'capital.common.fields.loan.totalFees.label',
    },
    expectedRepaymentPeriodValue: {
        CashAdvance: 'capital.common.numberOfDays',
        Loan: 'capital.common.daysWithDaysLeft',
    },
} satisfies ContractTypeKeyMap;
