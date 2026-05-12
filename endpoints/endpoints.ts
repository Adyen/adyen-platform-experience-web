import { BALANCE_ACCOUNTS_ENDPOINT, MSW_BASE_URL as baseUrl } from '@integration-components/testing/msw';

const datasetBaseUrl = '/datasets';

export const endpoints = () =>
    ({
        balanceAccounts: BALANCE_ACCOUNTS_ENDPOINT,
        balances: `${baseUrl}/balanceAccounts/:id/balances`,
        payouts: `${baseUrl}/payouts`,
        payout: `${baseUrl}/payouts/breakdown`,
        sessions: '/api/authe/api/v1/sessions',
        setup: `${baseUrl}/setup`,
        sendEngageEvent: `${baseUrl}/uxdsclient/engage`,
        sendTrackEvent: `${baseUrl}/uxdsclient/track`,
        stores: `${baseUrl}/stores`,
        capital: {
            anaCredit: `${baseUrl}/capital/grants/missingActions/anaCredit`,
            createOffer: `${baseUrl}/capital/grantOffers/create`,
            onboardingConfiguration: `${baseUrl}/capital/onboardingConfiguration`,
            dynamicOfferConfig: `${baseUrl}/capital/grantOffers/dynamic/configuration`,
            dynamicOffer: `${baseUrl}/capital/grantOffers/dynamic`,
            grants: `${baseUrl}/capital/grants`,
            requestFunds: `${baseUrl}/capital/grants/:id`,
            signToS: `${baseUrl}/capital/grants/missingActions/signToS`,
        },
        disputes: {
            accept: `${baseUrl}/disputes/:id/accept`,
            defend: `${baseUrl}/disputes/:id/defend`,
            details: `${baseUrl}/disputes/:id`,
            documents: `${baseUrl}/disputes/:id/documents`,
            download: `${baseUrl}/disputes/:id/documents/download`,
            list: `${baseUrl}/disputes`,
        },
        datasets: {
            countries: `${datasetBaseUrl}/countries/:locale.json?import`,
        },
    }) as const;
