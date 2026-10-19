import { MSW_BASE_URL } from '@integration-components/testing/msw';

const BASE_URL = `${MSW_BASE_URL}/cashout`;

export const ENDPOINTS = {
    eligibility: `${BASE_URL}/eligibility`,
    fees: `${BASE_URL}/fees`,
    instruct: BASE_URL,
} as const;
