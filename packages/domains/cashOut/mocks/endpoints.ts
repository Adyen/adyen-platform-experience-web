import { MSW_BASE_URL } from '@integration-components/testing/msw';

// `:accountKey` is the id of the balance account the cashOut is for.
const BASE_URL = `${MSW_BASE_URL}/:accountKey/cashout`;

export const ENDPOINTS = {
    eligibility: `${BASE_URL}/eligibility`,
    fees: `${BASE_URL}/fees`,
    instruct: BASE_URL,
} as const;
