import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL } from '@integration-components/testing/msw';

export const PAYOUTS_ENDPOINTS = {
    balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
    payouts: `${MSW_BASE_URL}/payouts`,
    payout: `${MSW_BASE_URL}/payouts/breakdown`,
} as const;
