import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    requestFirstGrant: {
        CashAdvance: 'capital.overview.cashAdvance.requestFirstGrant',
        Loan: 'capital.overview.loan.requestFirstGrant',
    },
    requestNewGrant: {
        CashAdvance: 'capital.overview.cashAdvance.requestNewGrant',
        Loan: 'capital.overview.loan.requestNewGrant',
    },
} satisfies ContractTypeKeyMap;
