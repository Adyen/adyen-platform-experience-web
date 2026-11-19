import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    repaymentIntro: {
        CashAdvance: 'capital.overview.repayment.cashAdvance.repaymentIntro',
        Loan: 'capital.overview.repayment.loan.repaymentIntro',
    },
    stepsTitle: {
        CashAdvance: 'capital.overview.repayment.steps.cashAdvance.title',
        Loan: 'capital.overview.repayment.steps.loan.title',
    },
    transferStep: {
        CashAdvance: 'capital.overview.repayment.steps.cashAdvance.transfer',
        Loan: 'capital.overview.repayment.steps.loan.transfer',
    },
} satisfies ContractTypeKeyMap;
