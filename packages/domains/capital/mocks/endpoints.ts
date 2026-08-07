import { MSW_BASE_URL } from '@integration-components/testing/msw';

const CAPITAL_BASE_URL = `${MSW_BASE_URL}/capital`;

export const CAPITAL_ENDPOINTS = {
    all: `${CAPITAL_BASE_URL}/*`,
    anaCredit: `${CAPITAL_BASE_URL}/grants/missingActions/anaCredit`,
    capitalState: `${CAPITAL_BASE_URL}/capitalState`,
    createOffer: `${CAPITAL_BASE_URL}/grantOffers/create`,
    onboardingConfiguration: `${CAPITAL_BASE_URL}/onboardingConfiguration`,
    dynamicOffer: `${CAPITAL_BASE_URL}/grantOffers/dynamic`,
    grants: `${CAPITAL_BASE_URL}/grants`,
    requestFunds: `${CAPITAL_BASE_URL}/grants/:id`,
    signToS: `${CAPITAL_BASE_URL}/grants/missingActions/signToS`,
} as const;
