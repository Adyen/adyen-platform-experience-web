import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL } from '@integration-components/testing/msw';

export const REPORTS_ENDPOINTS = {
    balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
    reports: `${MSW_BASE_URL}/reports`,
    downloadReport: `${MSW_BASE_URL}/reports/download`,
} as const;
