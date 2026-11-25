import {
    CAPITAL_STATE_ELIGIBLE_CA_LOAN,
    CAPITAL_STATE_ELIGIBLE_US_LOAN,
    CAPITAL_STATE_RENEWABLE_LOAN,
    CAPITAL_STATE_RENEWABLE_CASH_ADVANCE,
    CAPITAL_STATE_SINGLE_TERM_LOAN,
    CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_ELIGIBLE_WITH_ONGOING,
    CAPITAL_STATE_ELIGIBLE_UNSUPPORTED_CONTRACT,
} from '../mock-data';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { defaultHandlersCashAdvance, commonHandlers, defaultHandlersLoan } from './commonHandlers';
import { getDynamicOfferResponse, getErrorResponse, getGenericError } from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalOfferHandlers = {
    ...commonHandlers,
    eligibleWithOngoing: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_WITH_ONGOING);
            })
        ),
    ],
    eligibleLoan: defaultHandlersLoan,
    eligibleCashAdvance: defaultHandlersCashAdvance,
    eligibleUnsupportedContract: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_UNSUPPORTED_CONTRACT);
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
    errorOffer: [
        http.get(
            CAPITAL_ENDPOINTS.dynamicOffer,
            withDelay(({ request }) => {
                return getDynamicOfferResponse(request, 'Loan', 10);
            })
        ),
        ...defaultHandlersLoan,
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
    errorReview: [
        http.post(
            CAPITAL_ENDPOINTS.createOffer,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorSubmit: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return getErrorResponse(getGenericError(), 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorWithCodeSubmit: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600');
                return getErrorResponse(error, 500);
            })
        ),
        ...defaultHandlersLoan,
    ],
    errorBalanceAccount: [
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013');
                return getErrorResponse(error, 422);
            })
        ),
        ...defaultHandlersLoan,
    ],
};
