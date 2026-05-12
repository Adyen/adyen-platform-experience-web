import { MSW_BASE_URL } from '@integration-components/testing/msw';

export const PAY_BY_LINK_ENDPOINTS = {
    configuration: `${MSW_BASE_URL}/paybylink/paymentLinks/:storeId/configuration`,
    countries: `${MSW_BASE_URL}/paybylink/countries`,
    currencies: `${MSW_BASE_URL}/paybylink/currencies`,
    details: `${MSW_BASE_URL}/paybylink/paymentLinks/:id`,
    expire: `${MSW_BASE_URL}/paybylink/paymentLinks/:id/expire`,
    filters: `${MSW_BASE_URL}/paybylink/filters`,
    installments: `${MSW_BASE_URL}/paybylink/installments`,
    list: `${MSW_BASE_URL}/paybylink/paymentLinks`,
    settings: `${MSW_BASE_URL}/paybylink/settings/:storeId`,
    themes: `${MSW_BASE_URL}/paybylink/themes/:id`,
} as const;

// Cross-cutting endpoints shared with other domains
export const CROSS_CUTTING_ENDPOINTS = {
    stores: `${MSW_BASE_URL}/stores`,
    setup: `${MSW_BASE_URL}/setup`,
    datasetsCountries: `/datasets/countries/:locale.json`,
} as const;
