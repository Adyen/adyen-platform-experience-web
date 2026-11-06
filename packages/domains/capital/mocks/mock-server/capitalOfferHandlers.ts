import {
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    CAPITAL_STATE_ELIGIBLE_CA_LOAN,
    CAPITAL_STATE_ELIGIBLE_US_LOAN,
    CAPITAL_STATE_RENEWABLE_LOAN,
    CAPITAL_STATE_RENEWABLE_CASH_ADVANCE,
    CAPITAL_STATE_SINGLE_TERM_LOAN,
    CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_AND_ONGOING_LOAN,
    CAPITAL_STATE_ELIGIBLE_AND_ONGOING_CASH_ADVANCE,
    SIGNED_OFFER_LOAN,
    SIGNED_OFFER_CASH_ADVANCE,
} from '../mock-data';
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
    eligibleWithOngoingLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_AND_ONGOING_LOAN);
            })
        ),
    ],
    eligibleWithOngoingCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_AND_ONGOING_CASH_ADVANCE);
            })
        ),
    ],
    eligibleLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    eligibleCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
            })
        ),
    ],
    singleTermLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    singleTermCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
            })
        ),
    ],
    eligibleCALoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CA_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    eligibleUSLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_US_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    earlyRenewalLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_RENEWABLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    earlyRenewalCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_RENEWABLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
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
    errorReviewLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorReviewCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorSubmitLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorSubmitCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
    ],
    errorWithCodeSubmitLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
    ],
    errorWithCodeSubmitCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
    ],
    errorBalanceAccountLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
    ],
    errorBalanceAccountCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
    ],
};
