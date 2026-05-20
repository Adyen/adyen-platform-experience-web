import { MSW_BASE_URL } from '@integration-components/testing/msw';

export const CAPITAL_ENDPOINTS = {
    anaCredit: `${MSW_BASE_URL}/capital/grants/missingActions/anaCredit`,
    createOffer: `${MSW_BASE_URL}/capital/grantOffers/create`,
    onboardingConfiguration: `${MSW_BASE_URL}/capital/onboardingConfiguration`,
    dynamicOfferConfig: `${MSW_BASE_URL}/capital/grantOffers/dynamic/configuration`,
    dynamicOffer: `${MSW_BASE_URL}/capital/grantOffers/dynamic`,
    grants: `${MSW_BASE_URL}/capital/grants`,
    requestFunds: `${MSW_BASE_URL}/capital/grants/:id`,
    signToS: `${MSW_BASE_URL}/capital/grants/missingActions/signToS`,
} as const;
