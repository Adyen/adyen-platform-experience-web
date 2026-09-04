import {
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_FIRST_OFFER,
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
import { getCreateOfferResponse, getDynamicOfferResponse, getErrorResponse, getGenericError } from './utils';

export const capitalOfferHandlers = {
    ...commonHandlers,
    unsupportedRegion: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_UNSUPPORTED_REGION);
        }),
    ],
    ineligible: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_INELIGIBLE);
        }),
    ],
    eligible: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
    ],
    eligibleCA: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CA);
        }),
    ],
    eligibleUS: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_US);
        }),
    ],
    eligibleWithOngoingGrants: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
    ],
    earlyRenewal: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_RENEWABLE_GRANT);
        }),
    ],
    singleTerm: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM);
        }),
    ],
    errorOffer: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.dynamicOffer, ({ request }) => {
            return getDynamicOfferResponse(request, 10);
        }),
    ],
    errorTemporaryOffer: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.dynamicOffer, ({ request }) => {
            return getDynamicOfferResponse(request, 1);
        }),
    ],
    errorReview: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.createOffer, async () => {
            return getErrorResponse(getGenericError(), 500);
        }),
    ],
    errorSubmit: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
            return getErrorResponse(getGenericError(), 500);
        }),
    ],
    errorWithCodeSubmit: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
            return getErrorResponse(error, 500);
        }),
    ],
    errorBalanceAccount: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.createOffer, ({ request }) => {
            return getCreateOfferResponse(request);
        }),
        http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
            return getErrorResponse(error, 422);
        }),
    ],
};
