import {
    GRANTS,
    PENDING_GRANT,
    PENDING_GRANT_WITH_SINGLE_ACTION,
    REPAID_GRANT,
    SIGN_TOS_ACTION_DETAILS,
    ANACREDIT_ACTION_DETAILS,
    PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    ONBOARDING_CONFIGURATION,
    CAPITAL_STATE_UNQUALIFIED,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_GRANTS,
    CAPITAL_STATE_PENDING_GRANT,
    CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION,
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_RENEWABLE_GRANT,
    RENEWABLE_GRANT,
    ACTIVE_GRANT_WITHOUT_TRANSFER_INSTRUMENTS,
    ACTIVE_GRANT_US,
    ACTIVE_GRANT_GB,
    ACTIVE_GRANT_NL,
} from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { commonHandlers } from './commonHandlers';
import { getAsyncCapitalStateResponse, getAsyncGrantsResponse, getErrorResponse } from './utils';

export const capitalOverviewHandlers = {
    ...commonHandlers,
    ineligible: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_UNQUALIFIED);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [] });
        }),
    ],
    firstTimeEligible: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [] });
        }),
    ],
    earlyRenewal: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_RENEWABLE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [RENEWABLE_GRANT] });
        }),
    ],
    eligible: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [REPAID_GRANT] });
        }),
    ],
    grants: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: GRANTS });
        }),
    ],
    pending: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT] });
        }),
    ],
    multipleActions: [
        http.get(CAPITAL_ENDPOINTS.capitalState, ({ request }) => {
            return getAsyncCapitalStateResponse(request.url);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, ({ request }) => {
            return getAsyncGrantsResponse(request.url);
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            return HttpResponse.json(ONBOARDING_CONFIGURATION);
        }),
    ],
    singleAction: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT_WITH_SINGLE_ACTION] });
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            return HttpResponse.json(ONBOARDING_CONFIGURATION);
        }),
    ],
    multipleHostedActions: [
        http.get(CAPITAL_ENDPOINTS.capitalState, ({ request }) => {
            return getAsyncCapitalStateResponse(request.url);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, ({ request }) => {
            return getAsyncGrantsResponse(request.url);
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            return HttpResponse.json(undefined, { status: 204 });
        }),
        http.get(CAPITAL_ENDPOINTS.signToS, () => {
            return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
        }),
        http.get(CAPITAL_ENDPOINTS.anaCredit, () => {
            return HttpResponse.json(ANACREDIT_ACTION_DETAILS);
        }),
    ],
    singleHostedAction: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT_WITH_SINGLE_ACTION] });
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            return HttpResponse.json(undefined, { status: 204 });
        }),
        http.get(CAPITAL_ENDPOINTS.signToS, () => {
            return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
        }),
    ],
    repaymentNL: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [ACTIVE_GRANT_NL] });
        }),
    ],
    repaymentGB: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [ACTIVE_GRANT_GB] });
        }),
    ],
    repaymentUS: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [ACTIVE_GRANT_US] });
        }),
    ],
    repaymentWithoutTransferInstruments: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [ACTIVE_GRANT_WITHOUT_TRANSFER_INSTRUMENTS] });
        }),
    ],
    errorOnboardingConfig: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] });
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
            return getErrorResponse(error, 500);
        }),
        http.get(CAPITAL_ENDPOINTS.signToS, () => {
            return HttpResponse.json(SIGN_TOS_ACTION_DETAILS);
        }),
        http.get(CAPITAL_ENDPOINTS.anaCredit, () => {
            return HttpResponse.json(ANACREDIT_ACTION_DETAILS);
        }),
    ],
    errorHostedAction: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] });
        }),
        http.get(CAPITAL_ENDPOINTS.onboardingConfiguration, () => {
            return HttpResponse.json(undefined, { status: 204 });
        }),
        http.get(CAPITAL_ENDPOINTS.signToS, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
            return getErrorResponse(error, 500);
        }),
    ],
};
