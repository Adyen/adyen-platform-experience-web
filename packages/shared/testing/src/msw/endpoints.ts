// Shared MSW endpoint constants.
//
// `MSW_BASE_URL` is the regex URL pattern targeting the Adyen test environment;
// every domain's MSW handlers and root mocks should build their URLs from this.
//
// Cross-cutting endpoints used by multiple domains (e.g. balanceAccounts) live
// here so that no single domain owns them. Domain-specific endpoints
// (e.g. `/reports`, `/disputes/:id`) live inside their respective domain
// packages under `mocks/endpoints.ts`.
export const MSW_BASE_URL = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v([0-9]+)';

export const BALANCE_ACCOUNTS_ENDPOINT = `${MSW_BASE_URL}/balanceAccounts`;
