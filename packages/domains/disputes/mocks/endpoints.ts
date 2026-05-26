import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL } from '@integration-components/testing/msw';

export const DISPUTES_ENDPOINTS = {
    balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
    accept: `${MSW_BASE_URL}/disputes/:id/accept`,
    defend: `${MSW_BASE_URL}/disputes/:id/defend`,
    details: `${MSW_BASE_URL}/disputes/:id`,
    documents: `${MSW_BASE_URL}/disputes/:id/documents`,
    download: `${MSW_BASE_URL}/disputes/:id/documents/download`,
    list: `${MSW_BASE_URL}/disputes`,
} as const;
