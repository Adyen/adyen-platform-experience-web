import {
    DYNAMIC_CAPITAL_OFFER,
    GRANTS,
    PENDING_GRANT_WITH_SINGLE_ACTION,
    REPAID_GRANT,
    SIGNED_OFFER,
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
    CAPITAL_STATE_FIRST_OFFER_CAD,
    CAPITAL_STATE_GRANTS,
    CAPITAL_STATE_PENDING_GRANT,
    CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION,
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_RENEWABLE_GRANT,
    RENEWABLE_GRANT,
} from '../mock-data/capital';
import { DefaultBodyType, http, HttpResponse, JsonBodyType, StrictRequest } from 'msw';
import { calculateSelectedOffer, calculateOffers } from './utils/utils';
import { delay, getHandlerCallback, mocksFactory } from '@integration-components/testing/msw';
import { paths as capitalGrantOffersPaths } from '@integration-components/types/api/resources/CapitalGrantOffersResourceV2';
import { paths as capitalGrantsPaths } from '@integration-components/types/api/resources/CapitalGrantsResourceV1';
import { paths as capitalMissingActionsPaths } from '@integration-components/types/api/resources/CapitalMissingActionsResourceV1';
import { paths as capitalStatePaths } from '@integration-components/types/api/resources/CapitalStateResourceV1';
import { paths as onboardingSessionPaths } from '@integration-components/types/api/resources/OnboardingConfigurationResourceV1';
import { uuid } from '@integration-components/utils';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { ICreateGrantOfferRequest } from '@integration-components/types';
import { CAPITAL_ENDPOINTS } from '../endpoints';

const mockEndpoints = CAPITAL_ENDPOINTS;

const ASYNC_ACTION_DELAY_MS = Number(process.env.TEST_ENV) === 1 ? 0 : 2000;

const CAPITAL_STATE_UNQUALIFIED_HANDLER = getHandlerCallback({
    response: CAPITAL_STATE_UNQUALIFIED,
});

const EMPTY_GRANTS_LIST = getHandlerCallback({
    response: {
        data: [],
    },
});

let retries = 0;

const DYNAMIC_OFFER_HANDLER = async ({ request }: { request: StrictRequest<DefaultBodyType> }, retriesLimit?: number) => {
    const url = new URL(request.url);
    const { amount, currency } = { amount: url.searchParams.get('amount'), currency: url.searchParams.get('currency') };
    const numberAmount = Number(amount);

    if (!numberAmount || !currency) return;

    const response = calculateOffers(numberAmount, currency, DYNAMIC_CAPITAL_OFFER.maxAmount.value);
    await delay(400);

    if (retries < (retriesLimit || 0)) {
        if (retriesLimit && retries < retriesLimit) retries += 1;
        const options = { status: 500 };

        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'ServerError', 'Message', '500');

        return HttpResponse.json({ ...error, status: 500, detail: 'detail' }, options);
    }
    if (retriesLimit && retries === retriesLimit) retries = 0;

    return HttpResponse.json(response);
};

const OFFER_REVIEW_HANDLER = async ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
    const { amount, currency, selectedEstimatedRepaymentTermDays } = (await request.json()) as ICreateGrantOfferRequest;
    const offer = calculateSelectedOffer(amount, currency, selectedEstimatedRepaymentTermDays);
    await delay(400);
    return HttpResponse.json({ ...offer, id: uuid() });
};

export const capitalMock = [
    http.get(mockEndpoints.capitalState, CAPITAL_STATE_UNQUALIFIED_HANDLER),
    http.get(mockEndpoints.grants, EMPTY_GRANTS_LIST),
    http.get(mockEndpoints.dynamicOffer, DYNAMIC_OFFER_HANDLER),
    http.post(mockEndpoints.createOffer, OFFER_REVIEW_HANDLER),
    http.post(mockEndpoints.requestFunds, getHandlerCallback({ response: SIGNED_OFFER, delayTime: 800 })),
];

const getErrorHandler = (error: AdyenPlatformExperienceError, status = 500) => {
    return async () => {
        await delay(300);
        return HttpResponse.json({ ...error, status, detail: 'detail' }, { status });
    };
};

const genericError = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');

const getAsyncHandler = (initialResponse: JsonBodyType, finalResponse: JsonBodyType) => {
    let firstCallTime: number | undefined;
    return async () => {
        if (!firstCallTime) {
            firstCallTime = Date.now();
        }
        const elapsedTime = Date.now() - firstCallTime;
        const response = elapsedTime < ASYNC_ACTION_DELAY_MS ? initialResponse : finalResponse;
        return getHandlerCallback({ response, status: 200 })();
    };
};

const getAsyncGrantsHandler = () => getAsyncHandler({ data: [PENDING_GRANT_WITH_SINGLE_ACTION] }, { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] });

const getAsyncCapitalStateHandler = () =>
    getAsyncHandler(CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION, CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS);

const commonHandlers = {
    errorStateNoOfferCapability: [
        {
            endpoint: mockEndpoints.capitalState,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, '825ac4ce59f0f159ad672d38d3291i55', 'Message', '30_016'),
                422
            ),
        },
    ],
    errorStateInactiveAccountHolder: [
        {
            endpoint: mockEndpoints.capitalState,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e92', 'Message', '30_011'),
                422
            ),
        },
    ],
};

const capitalFactory = mocksFactory<
    capitalGrantOffersPaths & capitalGrantsPaths & capitalMissingActionsPaths & capitalStatePaths & onboardingSessionPaths
>();

export const CapitalOfferMockedResponses = capitalFactory({
    ...commonHandlers,
    default: [{ endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS }],
    earlyRenewal: [{ endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_RENEWABLE_GRANT }],
    aprField: [{ endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER_CAD }],
    errorDynamicOfferExceededRetries: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        { endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 10)) as any },
    ],
    errorDynamicOfferTemporary: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        { endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 1)) as any },
    ],
    errorReviewOfferGeneric: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        {
            endpoint: mockEndpoints.createOffer,
            handler: getErrorHandler(genericError, 500),
            method: 'post',
        },
    ],
    errorRequestFundsGeneric: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(genericError, 500),
            method: 'post',
        },
    ],
    errorRequestFundsGenericWithCode: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, '226ac4ce59f0f159ad672d38d3291e93', 'Message', '30_600'),
                500
            ),
            method: 'post',
        },
    ],
    errorRequestFundsNoPrimaryBalanceAccount: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        {
            endpoint: mockEndpoints.createOffer,
            handler: ((req: any) => OFFER_REVIEW_HANDLER(req)) as any,
            method: 'post',
        },
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message', '30_013'),
                422
            ),
            method: 'post',
        },
    ],
});

export const CapitalOverviewMockedResponses = capitalFactory({
    ...commonHandlers,
    prequalified: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_FIRST_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    grantPending: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_PENDING_GRANT },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT] } },
    ],
    grantMultipleActionsEmbedded: [
        { endpoint: mockEndpoints.capitalState, handler: getAsyncCapitalStateHandler() },
        { endpoint: mockEndpoints.grants, handler: getAsyncGrantsHandler() },
        { endpoint: mockEndpoints.onboardingConfiguration, response: ONBOARDING_CONFIGURATION },
    ],
    grantMultipleActionsHosted: [
        { endpoint: mockEndpoints.capitalState, handler: getAsyncCapitalStateHandler() },
        { endpoint: mockEndpoints.grants, handler: getAsyncGrantsHandler() },
        { endpoint: mockEndpoints.onboardingConfiguration, handler: getHandlerCallback({ response: undefined, status: 204 }) },
        { endpoint: mockEndpoints.signToS, handler: getHandlerCallback({ response: SIGN_TOS_ACTION_DETAILS, status: 200 }) },
        { endpoint: mockEndpoints.anaCredit, handler: getHandlerCallback({ response: ANACREDIT_ACTION_DETAILS, status: 200 }) },
    ],
    grantSingleActionEmbedded: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_SINGLE_ACTION] } },
        { endpoint: mockEndpoints.onboardingConfiguration, response: ONBOARDING_CONFIGURATION },
    ],
    grantSingleActionHosted: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_SINGLE_ACTION] } },
        { endpoint: mockEndpoints.onboardingConfiguration, handler: getHandlerCallback({ response: undefined, status: 204 }) },
        { endpoint: mockEndpoints.signToS, handler: getHandlerCallback({ response: SIGN_TOS_ACTION_DETAILS, status: 200 }) },
    ],
    grantActive: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_ACTIVE_GRANT },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_GRANT] } },
    ],
    repaymentNL: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_ACTIVE_GRANT },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT] }],
            },
        },
    ],
    repaymentGB: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_ACTIVE_GRANT },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_GB_ACCOUNT] }],
            },
        },
    ],
    repaymentUS: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_ACTIVE_GRANT },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_US_ACCOUNT] }],
            },
        },
    ],
    repaymentNoTransferInstruments: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_ACTIVE_GRANT },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT], transferInstruments: [] }],
            },
        },
    ],
    grantFailed: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: [FAILED_GRANT] } },
    ],
    grantRepaid: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    grantRevoked: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: [REVOKED_GRANT] } },
    ],
    grantWrittenOff: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: [WRITTEN_OFF_GRANT] } },
    ],
    earlyRenewal: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_RENEWABLE_GRANT },
        { endpoint: mockEndpoints.grants, response: { data: [RENEWABLE_GRANT] } },
    ],
    newOffer: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_CLOSED_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    grants: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_GRANTS },
        { endpoint: mockEndpoints.grants, response: { data: GRANTS } },
    ],
    errorActionsEmbedded: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] } },
        {
            endpoint: mockEndpoints.onboardingConfiguration,
            handler: getErrorHandler(new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message'), 500),
        },
        { endpoint: mockEndpoints.signToS, handler: getHandlerCallback({ response: ANACREDIT_ACTION_DETAILS, status: 200 }) },
        { endpoint: mockEndpoints.signToS, handler: getHandlerCallback({ response: SIGN_TOS_ACTION_DETAILS, status: 200 }) },
    ],
    errorActionsHosted: [
        { endpoint: mockEndpoints.capitalState, response: CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] } },
        { endpoint: mockEndpoints.onboardingConfiguration, handler: getHandlerCallback({ response: undefined, status: 204 }) },
        {
            endpoint: mockEndpoints.signToS,
            handler: getErrorHandler(new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message'), 500),
        },
    ],
});
