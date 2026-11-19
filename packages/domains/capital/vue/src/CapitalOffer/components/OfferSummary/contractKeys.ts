import type { ContractTypeKeyMap } from '@integration-components/capital/domain';

export const CONTRACT_KEYS = {
    renewalAcceptanceDescription: {
        CashAdvance: 'capital.offer.summary.renewalNotice.cashAdvance.acceptanceDescription',
        Loan: undefined,
    },
    renewalDeclineDescription: {
        CashAdvance: 'capital.offer.summary.renewalNotice.cashAdvance.declineDescription',
        Loan: undefined,
    },
    renewalDescription: {
        CashAdvance: 'capital.offer.summary.renewalNotice.cashAdvance.description',
        Loan: 'capital.offer.summary.renewalNotice.loan.description',
    },
    renewalSecondaryTitle: {
        CashAdvance: 'capital.offer.summary.renewalNotice.cashAdvance.secondaryTitle',
        Loan: undefined,
    },
    renewalTitle: {
        CashAdvance: 'capital.offer.summary.renewalNotice.cashAdvance.title',
        Loan: 'capital.offer.summary.renewalNotice.loan.title',
    },
    compareGrantsTitle: {
        CashAdvance: 'capital.offer.summary.cashAdvance.compareGrantsTitle',
        Loan: 'capital.offer.summary.loan.compareGrantsTitle',
    },
    earlyRenewalBreakdownTitle: {
        CashAdvance: 'capital.offer.summary.cashAdvance.earlyRenewalBreakdownTitle',
        Loan: 'capital.offer.summary.loan.earlyRenewalBreakdownTitle',
    },
    newGrantBreakdownTitle: {
        CashAdvance: 'capital.offer.summary.cashAdvance.newGrantBreakdownTitle',
        Loan: 'capital.offer.summary.loan.newGrantBreakdownTitle',
    },
} satisfies ContractTypeKeyMap;
