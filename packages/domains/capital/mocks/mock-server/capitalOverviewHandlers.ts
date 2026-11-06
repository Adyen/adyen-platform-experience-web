import {
    ANACREDIT_ACTION_DETAILS,
    CAPITAL_STATE_ACTIONS_LOAN,
    CAPITAL_STATE_ACTIVE,
    CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE,
    CAPITAL_STATE_ELIGIBLE_LOAN,
    CAPITAL_STATE_FIRST_TIME_ELIGIBLE_CASH_ADVANCE,
    CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN,
    CAPITAL_STATE_GRANTS_CASH_ADVANCE,
    CAPITAL_STATE_GRANTS_LOAN,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_PENDING_CASH_ADVANCE,
    CAPITAL_STATE_PENDING_LOAN,
    CAPITAL_STATE_RENEWABLE_CASH_ADVANCE,
    CAPITAL_STATE_RENEWABLE_LOAN,
    CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE,
    CAPITAL_STATE_SINGLE_ACTION_LOAN,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    GRANTS_CASH_ADVANCE,
    GRANTS_LOAN,
    ACTIONS_LOAN,
    ONBOARDING_CONFIGURATION,
    REPAID_CASH_ADVANCE,
    REPAID_LOAN,
    SIGN_TOS_ACTION_DETAILS,
    SINGLE_ACTION_CASH_ADVANCE,
    SINGLE_ACTION_LOAN,
    RENEWABLE_LOAN,
    RENEWABLE_CASH_ADVANCE,
    PENDING_LOAN,
    PENDING_CASH_ADVANCE,
    ACTIVE_REPAYMENT_US,
    ACTIVE_WITHOUT_TRANSFER_INSTRUMENTS,
    ACTIVE_WITHOUT_REPAYMENT_ACCOUNT,
    SIGNED_OFFER_LOAN,
    SIGNED_OFFER_CASH_ADVANCE,
} from '../mock-data';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { commonHandlers } from './commonHandlers';
import {
    getAsyncCapitalStateCashAdvanceResponse,
    getAsyncCapitalStateLoanResponse,
    getAsyncGrantsCashAdvanceResponse,
    getAsyncGrantsLoanResponse,
    getErrorResponse,
} from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalOverviewHandlers = {
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
    firstTimeEligibleLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [] });
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_LOAN);
            })
        ),
    ],
    firstTimeEligibleCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_FIRST_TIME_ELIGIBLE_CASH_ADVANCE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [] });
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
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
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [RENEWABLE_LOAN] });
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
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [RENEWABLE_CASH_ADVANCE] });
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
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
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [REPAID_LOAN] });
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
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [REPAID_CASH_ADVANCE] });
            })
        ),
        http.post(
            CAPITAL_ENDPOINTS.requestFunds,
            withDelay(() => {
                return HttpResponse.json(SIGNED_OFFER_CASH_ADVANCE);
            })
        ),
    ],
    grantsLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_GRANTS_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: GRANTS_LOAN });
            })
        ),
    ],
    grantsCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_GRANTS_CASH_ADVANCE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: GRANTS_CASH_ADVANCE });
            })
        ),
    ],
    pendingLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_PENDING_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [PENDING_LOAN] });
            })
        ),
    ],
    pendingCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_PENDING_CASH_ADVANCE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [PENDING_CASH_ADVANCE] });
            })
        ),
    ],
    actionsLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(({ request }) => {
                return getAsyncCapitalStateLoanResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(({ request }) => {
                return getAsyncGrantsLoanResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(ONBOARDING_CONFIGURATION);
            })
        ),
    ],
    actionsCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(({ request }) => {
                return getAsyncCapitalStateCashAdvanceResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(({ request }) => {
                return getAsyncGrantsCashAdvanceResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(ONBOARDING_CONFIGURATION);
            })
        ),
    ],
    singleActionLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [SINGLE_ACTION_LOAN] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(ONBOARDING_CONFIGURATION);
            })
        ),
    ],
    singleActionCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [SINGLE_ACTION_CASH_ADVANCE] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(ONBOARDING_CONFIGURATION);
            })
        ),
    ],
    hostedActionsLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(({ request }) => {
                return getAsyncCapitalStateLoanResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(({ request }) => {
                return getAsyncGrantsLoanResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(undefined, { status: 204 });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.anaCredit,
            withDelay(() => {
                return HttpResponse.json(ANACREDIT_ACTION_DETAILS);
            })
        ),
    ],
    hostedActionsCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(({ request }) => {
                return getAsyncCapitalStateCashAdvanceResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(({ request }) => {
                return getAsyncGrantsCashAdvanceResponse(request.url);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(undefined, { status: 204 });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.anaCredit,
            withDelay(() => {
                return HttpResponse.json(ANACREDIT_ACTION_DETAILS);
            })
        ),
    ],
    singleHostedActionLoan: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [SINGLE_ACTION_LOAN] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(undefined, { status: 204 });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
            })
        ),
    ],
    singleHostedActionCashAdvance: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [SINGLE_ACTION_CASH_ADVANCE] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(undefined, { status: 204 });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
            })
        ),
    ],
    repaymentUS: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIVE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [ACTIVE_REPAYMENT_US] });
            })
        ),
    ],
    repaymentWithoutTransferInstruments: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIVE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [ACTIVE_WITHOUT_TRANSFER_INSTRUMENTS] });
            })
        ),
    ],
    withoutRepayment: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIVE);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [ACTIVE_WITHOUT_REPAYMENT_ACCOUNT] });
            })
        ),
    ],
    errorOnboardingConfig: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIONS_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [ACTIONS_LOAN] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
                return getErrorResponse(error, 500);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.anaCredit,
            withDelay(() => {
                return HttpResponse.json(ANACREDIT_ACTION_DETAILS);
            })
        ),
    ],
    errorHostedAction: [
        http.get(
            CAPITAL_ENDPOINTS.capitalState,
            withDelay(() => {
                return HttpResponse.json(CAPITAL_STATE_ACTIONS_LOAN);
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.grants,
            withDelay(() => {
                return HttpResponse.json({ data: [ACTIONS_LOAN] });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.onboardingConfiguration,
            withDelay(() => {
                return HttpResponse.json(undefined, { status: 204 });
            })
        ),
        http.get(
            CAPITAL_ENDPOINTS.signToS,
            withDelay(() => {
                const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
                return getErrorResponse(error, 500);
            })
        ),
    ],
};
