import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    repaymentPlanTitle: {
        CashAdvance: 'capital.offer.selection.cashAdvance.repaymentPlanTitle',
        Loan: 'capital.offer.selection.loan.repaymentPlanTitle',
    },
} satisfies ContractTypeKeyMap;
