import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL, SETUP_ENDPOINT } from '@integration-components/testing/msw';

export const TRANSACTIONS_ENDPOINTS = {
    balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
    balances: `${MSW_BASE_URL}/balanceAccounts/:id/balances`,
    transactions: `${MSW_BASE_URL}/transactions`,
    transaction: `${MSW_BASE_URL}/transactions/:id`,
    initiateRefund: `${MSW_BASE_URL}/transactions/:id/refund`,
    transactionsTotals: `${MSW_BASE_URL}/transactions/totals`,
    downloadTransactions: `${MSW_BASE_URL}/transactions/download`,
    setup: SETUP_ENDPOINT,
} as const;
