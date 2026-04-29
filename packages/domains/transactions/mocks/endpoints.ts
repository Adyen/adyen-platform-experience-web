import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL } from '@integration-components/testing/msw';

export const TRANSACTIONS_ENDPOINTS = {
    balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
    balances: `${MSW_BASE_URL}/balanceAccounts/:id/balances`,
    transactions: `${MSW_BASE_URL}/transactions`,
    transaction: `${MSW_BASE_URL}/transactions/:id`,
    initiateRefund: `${MSW_BASE_URL}/transactions/:id/refund`,
    transactionsTotals: `${MSW_BASE_URL}/transactions/totals`,
    downloadTransactions: `${MSW_BASE_URL}/transactions/download`,
    setup: `${MSW_BASE_URL}/setup`,
} as const;
