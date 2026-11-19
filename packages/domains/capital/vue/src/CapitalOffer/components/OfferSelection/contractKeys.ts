import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    contractTypeNotice: {
        CashAdvance: 'capital.offer.selection.cashAdvance.contractTypeNotice',
        Loan: undefined,
    },
} satisfies ContractTypeKeyMap;
