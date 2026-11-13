import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { getCreateOfferResponse, getDynamicOfferResponse, getErrorResponse } from './utils';
import { withDelay } from '@integration-components/testing/msw';
import {
    CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    SIGNED_OFFER_CASH_ADVANCE,
    SIGNED_OFFER_LOAN,
} from '../mock-data';

// Handlers for stories that appear on both Capital Offer and Capital Overview components
export const commonHandlers = {
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
    errorOfferConfig: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '825ac4ce59f0f159ad672d38d3291i55', 'Message', '30_016');
                return getErrorResponse(error, 422);
            })
        ),
    ],
    errorAccountHolder: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e92', 'Message', '30_011');
                return getErrorResponse(error, 422);
            })
        ),
    ],
};

// Default handlers for loan-related stories
export const defaultHandlersLoan = [
    http.get(
        CAPITAL_ENDPOINTS.capitalState,
        withDelay(() => {
            return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
        })
    ),
    http.get(
        CAPITAL_ENDPOINTS.dynamicOffer,
        withDelay(({ request }) => {
            return getDynamicOfferResponse(request, 'Loan');
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.createOffer,
        withDelay(({ request }) => {
            return getCreateOfferResponse(request, 'Loan');
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.requestFunds,
        withDelay(() => {
            return HttpResponse.json(SIGNED_OFFER_LOAN);
        })
    ),
];

// Default handlers for cash-advance-related stories
export const defaultHandlersCashAdvance = [
    http.get(
        CAPITAL_ENDPOINTS.capitalState,
        withDelay(() => {
            return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
        })
    ),
    http.get(
        CAPITAL_ENDPOINTS.dynamicOffer,
        withDelay(({ request }) => {
            return getDynamicOfferResponse(request, 'CashAdvance');
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.createOffer,
        withDelay(({ request }) => {
            return getCreateOfferResponse(request, 'CashAdvance');
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.requestFunds,
        withDelay(() => {
            return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
        })
    ),
];
