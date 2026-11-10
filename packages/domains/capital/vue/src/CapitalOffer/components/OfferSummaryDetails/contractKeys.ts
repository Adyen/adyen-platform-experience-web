import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    currentGrantTab: {
        CashAdvance: 'capital.offer.summary.cashAdvance.currentGrant',
        Loan: 'capital.offer.summary.loan.currentGrant',
    },
    newGrantTab: {
        CashAdvance: 'capital.offer.summary.cashAdvance.newGrant',
        Loan: 'capital.offer.summary.loan.newGrant',
    },
} satisfies ContractTypeKeyMap;
