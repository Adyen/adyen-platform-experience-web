// Shared MSW endpoint constants.
//
// `MSW_BASE_URL` is the regex URL pattern targeting the Adyen test environment;
// every domain's MSW handlers and root mocks should build their URLs from this.
//
// Cross-domain endpoints used by multiple domains (e.g. balanceAccounts) live
// here so that no single domain owns them. Domain-specific endpoints
// (e.g. `/reports`, `/disputes/:id`) live inside their respective domain
// packages under `mocks/endpoints.ts`.
export const MSW_BASE_URL = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v([0-9]+)';

export const CROSS_DOMAIN_ENDPOINTS = {
    balanceAccounts: `${MSW_BASE_URL}/balanceAccounts`,
    datasetsCountries: `/datasets/countries/:locale.json`,
    setup: `${MSW_BASE_URL}/setup`,
    stores: `${MSW_BASE_URL}/stores`,
} as const;

export const BALANCE_ACCOUNTS_ENDPOINT = CROSS_DOMAIN_ENDPOINTS.balanceAccounts;
export const SETUP_ENDPOINT = CROSS_DOMAIN_ENDPOINTS.setup;
