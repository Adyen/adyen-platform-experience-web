import { MSW_BASE_URL } from '@integration-components/testing/msw';

export const CAPITAL_ENDPOINTS = {
    setup: `${MSW_BASE_URL}/setup`,
    all: `${MSW_BASE_URL}/capital/*`,
    anaCredit: `${MSW_BASE_URL}/capital/grants/missingActions/anaCredit`,
    capitalState: `${MSW_BASE_URL}/capital/capitalState`,
    createOffer: `${MSW_BASE_URL}/capital/grantOffers/create`,
    onboardingConfiguration: `${MSW_BASE_URL}/capital/onboardingConfiguration`,
    dynamicOffer: `${MSW_BASE_URL}/capital/grantOffers/dynamic`,
    grants: `${MSW_BASE_URL}/capital/grants`,
    requestFunds: `${MSW_BASE_URL}/capital/grants/:id`,
    signToS: `${MSW_BASE_URL}/capital/grants/missingActions/signToS`,
} as const;
