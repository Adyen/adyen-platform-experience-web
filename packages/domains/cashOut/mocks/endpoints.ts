import { MSW_BASE_URL, MSW_CASH_OUT_UI_BASE_URL } from '@integration-components/testing/msw';

// `:accountKey` is the account key of the balance account the cashOut is for, `BalanceAccount.<id>`, or for the available amounts the
// one of the account holder, `BalanceAccountHolder.<id>`. The state takes either, as the account of the session.
// Served by cashout-ui, as /setup advertises.
const BASE_URL = `${MSW_CASH_OUT_UI_BASE_URL}/:accountKey/cashout`;

export const ENDPOINTS = {
    // The account of the session, which the available amounts are asked for when it's an account holder.
    accounts: `${MSW_BASE_URL}/accounts`,
    availableAmounts: `${BASE_URL}/availableAmounts`,
    eligibility: `${BASE_URL}/eligibility`,
    fees: `${BASE_URL}/fees`,
    state: `${BASE_URL}/state`,
    instruct: BASE_URL,
} as const;
