import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    amountTitle: {
        CashAdvance: 'capital.offer.selection.cashAdvance.amountTitle',
        Loan: 'capital.offer.selection.loan.amountTitle',
    },
} satisfies ContractTypeKeyMap;
