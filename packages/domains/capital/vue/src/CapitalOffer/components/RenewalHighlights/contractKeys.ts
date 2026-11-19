import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    currentRemainingGrantAmount: {
        CashAdvance: 'capital.offer.cashAdvance.currentRemainingGrantAmount',
        Loan: 'capital.offer.loan.currentRemainingGrantAmount',
    },
} satisfies ContractTypeKeyMap;
