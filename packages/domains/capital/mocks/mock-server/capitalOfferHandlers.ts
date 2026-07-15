import {
    CAPITAL_STATE_UNQUALIFIED,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_FIRST_OFFER_CAD,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_RENEWABLE_GRANT,
} from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { commonHandlers } from './commonHandlers';
import { getCreateOfferResponse, getDynamicOfferResponse, getErrorResponse, getGenericError } from './utils';

export const capitalOfferHandlers = {
    ...commonHandlers,
    default: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
    ],
    earlyRenewal: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_RENEWABLE_GRANT);
        }),
    ],
    aprField: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER_CAD);
        }),
    ],
    unqualified: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_UNQUALIFIED);
        }),
    ],
    errorDynamicOfferExceededRetries: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.dynamicOffer, ({ request }) => {
            return getDynamicOfferResponse(request, 10);
        }),
    ],
    errorDynamicOfferTemporary: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.dynamicOffer, ({ request }) => {
            return getDynamicOfferResponse(request, 1);
        }),
    ],
    errorReviewOfferGeneric: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.createOffer, async () => {
            return getErrorResponse(getGenericError(), 500);
        }),
    ],
    errorRequestFundsGeneric: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
            return getErrorResponse(getGenericError(), 500);
        }),
    ],
    errorRequestFundsGenericWithCode: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
            return getErrorResponse(error, 500);
        }),
    ],
    errorRequestFundsNoPrimaryBalanceAccount: [
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
