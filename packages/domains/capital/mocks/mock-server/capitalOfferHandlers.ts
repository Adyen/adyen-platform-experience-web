import {
    CAPITAL_STATE_ELIGIBLE_CA_LOAN,
    CAPITAL_STATE_ELIGIBLE_US_LOAN,
    CAPITAL_STATE_RENEWABLE_LOAN,
    CAPITAL_STATE_RENEWABLE_CASH_ADVANCE,
    CAPITAL_STATE_SINGLE_TERM_LOAN,
    CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_ELIGIBLE_AND_ONGOING_LOAN,
    CAPITAL_STATE_ELIGIBLE_AND_ONGOING_CASH_ADVANCE,
} from '../mock-data';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { defaultHandlersCashAdvance, commonHandlers, defaultHandlersLoan } from './commonHandlers';
import { getDynamicOfferResponse, getErrorResponse, getGenericError } from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalOfferHandlers = {
    ...commonHandlers,
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
    eligibleLoan: defaultHandlersLoan,
    eligibleCashAdvance: defaultHandlersCashAdvance,
    singleTermLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM_LOAN);
            })
        ),
        ...defaultHandlersLoan,
    ],
    singleTermCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    eligibleCALoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_CA_LOAN);
            })
        ),
        ...defaultHandlersLoan,
    ],
    eligibleUSLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_US_LOAN);
            })
        ),
        ...defaultHandlersLoan,
    ],
    earlyRenewalLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_RENEWABLE_LOAN);
            })
        ),
        ...defaultHandlersLoan,
    ],
    earlyRenewalCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_RENEWABLE_CASH_ADVANCE);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    errorOfferLoan: [
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 'Loan', 10);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorOfferCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 'Loan', 10);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    errorTemporaryOffer: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 'Loan', 1);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorReviewLoan: [
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorReviewCashAdvance: [
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    errorSubmitLoan: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorSubmitCashAdvance: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    errorWithCodeSubmitLoan: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorWithCodeSubmitCashAdvance: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
    errorBalanceAccountLoan: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorBalanceAccountCashAdvance: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
        ...defaultHandlersCashAdvance,
    ],
};
