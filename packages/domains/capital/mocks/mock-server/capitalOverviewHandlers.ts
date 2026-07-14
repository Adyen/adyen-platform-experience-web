import {
    GRANTS,
    PENDING_GRANT_WITH_SINGLE_ACTION,
    REPAID_GRANT,
    SIGN_TOS_ACTION_DETAILS,
    PENDING_GRANT,
    ACTIVE_GRANT,
    FAILED_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
    GRANT_US_ACCOUNT,
    GRANT_GB_ACCOUNT,
    ANACREDIT_ACTION_DETAILS,
    PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    GRANT_NL_ACCOUNT,
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
} from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { commonHandlers } from './commonHandlers';
import { getAsyncCapitalStateResponse, getAsyncGrantsResponse, getErrorResponse } from './utils';

export const capitalOverviewHandlers = {
    ...commonHandlers,
    unqualified: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_UNQUALIFIED);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [] });
        }),
    ],
    prequalified: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [] });
        }),
    ],
    grantPending: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_PENDING_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [PENDING_GRANT] });
        }),
    ],
    grantMultipleActionsEmbedded: [
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
    grantMultipleActionsHosted: [
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
    grantSingleActionEmbedded: [
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
    grantSingleActionHosted: [
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
    grantActive: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [ACTIVE_GRANT] });
        }),
    ],
    repaymentNL: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT] }],
            });
        }),
    ],
    repaymentGB: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_GB_ACCOUNT] }],
            });
        }),
    ],
    repaymentUS: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_US_ACCOUNT] }],
            });
        }),
    ],
    repaymentNoTransferInstruments: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_ACTIVE_GRANT);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT], transferInstruments: [] }],
            });
        }),
    ],
    grantFailed: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [FAILED_GRANT] });
        }),
    ],
    grantRepaid: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [REPAID_GRANT] });
        }),
    ],
    grantRevoked: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [REVOKED_GRANT] });
        }),
    ],
    grantWrittenOff: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            return HttpResponse.json(CAPITAL_STATE_CLOSED_GRANTS);
        }),
        http.get(CAPITAL_ENDPOINTS.grants, () => {
            return HttpResponse.json({ data: [WRITTEN_OFF_GRANT] });
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
    newOffer: [
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
    errorActionsEmbedded: [
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
    errorActionsHosted: [
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
