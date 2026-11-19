import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    firstGrantTitle: {
        CashAdvance: 'capital.overview.offerAlert.cashAdvance.firstGrant.title',
        Loan: 'capital.overview.offerAlert.loan.firstGrant.title',
    },
    newGrantTitle: {
        CashAdvance: 'capital.overview.offerAlert.cashAdvance.newGrant.title',
        Loan: 'capital.overview.offerAlert.loan.newGrant.title',
    },
    renewalDescription: {
        CashAdvance: 'capital.overview.offerAlert.cashAdvance.renewal.description',
        Loan: 'capital.overview.offerAlert.loan.renewal.description',
    },
} satisfies ContractTypeKeyMap;
