import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    copyGrantId: {
        CashAdvance: 'capital.overview.grantItem.cashAdvance.copyGrantID.a11yLabel',
        Loan: 'capital.overview.grantItem.loan.copyGrantID.a11yLabel',
    },
    repaymentRatio: {
        CashAdvance: 'capital.overview.grantItem.cashAdvance.repaymentRatio',
        Loan: 'capital.overview.grantItem.loan.repaymentRatio',
    },
    sendRepayment: {
        CashAdvance: 'capital.overview.grantItem.cashAdvance.sendRepayment',
        Loan: 'capital.overview.grantItem.loan.sendRepayment',
    },
    termEnds: {
        CashAdvance: undefined,
        Loan: 'capital.overview.grantItem.loan.termEnds',
    },
} satisfies ContractTypeKeyMap;
