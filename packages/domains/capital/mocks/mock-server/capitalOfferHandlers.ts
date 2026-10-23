import {
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_RENEWABLE_GRANT,
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    CAPITAL_STATE_US,
    CAPITAL_STATE_CA,
    CAPITAL_STATE_SINGLE_TERM,
} from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { commonHandlers } from './commonHandlers';
import { getDynamicOfferResponse, getErrorResponse, getGenericError } from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalOfferHandlers = {
    ...commonHandlers,
    unsupportedRegion: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_UNSUPPORTED_REGION);
            })
        ),
    ],
    ineligible: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_INELIGIBLE);
            })
        ),
    ],
    eligible: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
            })
        ),
    ],
    eligibleCA: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_CA);
            })
        ),
    ],
    eligibleUS: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_US);
            })
        ),
    ],
    eligibleWithOngoingGrants: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
            })
        ),
    ],
    earlyRenewal: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_RENEWABLE_GRANT);
            })
        ),
    ],
    singleTerm: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM);
            })
        ),
    ],
    errorOffer: [
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 10);
            })
        ),
    ],
    errorTemporaryOffer: [
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 1);
            })
        ),
    ],
    errorReview: [
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorSubmit: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorWithCodeSubmit: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
    ],
    errorBalanceAccount: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
    ],
};
