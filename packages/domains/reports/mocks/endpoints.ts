const API_BASE_URL = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v([0-9]+)';

export const REPORTS_ENDPOINTS = {
    balanceAccounts: `${API_BASE_URL}/balanceAccounts`,
    reports: `${API_BASE_URL}/reports`,
    downloadReport: `${API_BASE_URL}/reports/download`,
} as const;
