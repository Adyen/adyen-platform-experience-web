import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    providerInfoGB: {
        CashAdvance: 'capital.common.providerInfo.cashAdvance.GB',
        Loan: 'capital.common.providerInfo.GB',
    },
    selectionTitle: {
        CashAdvance: 'capital.offer.selection.cashAdvance.title',
        Loan: 'capital.offer.selection.loan.title',
    },
    summaryTitle: {
        CashAdvance: 'capital.offer.summary.cashAdvance.title',
        Loan: 'capital.offer.summary.loan.title',
    },
} satisfies ContractTypeKeyMap;
