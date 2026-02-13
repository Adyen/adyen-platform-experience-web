import {
    DYNAMIC_CAPITAL_OFFER,
    GRANTS,
    PENDING_GRANT_WITH_SIGN_TOS,
    REPAID_GRANT,
    SIGNED_OFFER,
    PENDING_GRANT,
    ACTIVE_GRANT,
    FAILED_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
    GRANT_US_ACCOUNT,
    GRANT_GB_ACCOUNT,
    CAD_CAPITAL_OFFER,
    PENDING_GRANT_WITH_ANACREDIT,
    PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    GRANT_NL_ACCOUNT,
    ONBOARDING_CONFIGURATION,
} from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';
import { calculateGrant, delay } from './utils/utils';
import { getHandlerCallback, mocksFactory } from './utils/mocksHandlerFactory';
import { paths as CapitalGrantOfferPaths } from '../../src/types/api/resources/CapitalGrantOffersResource';
import { paths as CapitalGrantsPaths } from '../../src/types/api/resources/CapitalGrantsResource';
import { paths as CapitalMissingActionsPaths } from '../../src/types/api/resources/CapitalMissingActionsResource';
import { paths as OnboardingSessionPaths } from '../../src/types/api/resources/OnboardingConfigurationResource';
import uuid from '../../src/utils/random/uuid';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';

const mockEndpoints = endpoints().capital;
const networkError = false;

const EMPTY_GRANTS_LIST = getHandlerCallback({
    response: {
        data: [],
    },
});

const EMPTY_OFFER = getHandlerCallback({ response: {} });

let retries = 0;

const DYNAMIC_OFFER_HANDLER = async ({ request }: { request: StrictRequest<DefaultBodyType> }, retriesLimit?: number) => {
    const url = new URL(request.url);
    const { amount, currency } = { amount: url.searchParams.get('amount'), currency: url.searchParams.get('currency') };

    if (!amount || !currency) return;

    const response = calculateGrant(amount, currency);
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
    const { amount, currency } = (await request.json()) as { amount: number; currency: string };

    const response = calculateGrant(amount, currency);
    await delay(400);
    return HttpResponse.json({ ...response, id: uuid() });
};

export const capitalMock = [
    http.get(mockEndpoints.dynamicOfferConfig, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(400);
        return HttpResponse.json({});
    }),
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

const commonHandlers = {
    errorDynamicOfferConfigNoCapability: [
        {
            endpoint: mockEndpoints.dynamicOfferConfig,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, '825ac4ce59f0f159ad672d38d3291i55', 'Message', '30_016'),
                422
            ),
        },
    ],
    errorDynamicOfferConfigInactiveAccountHolder: [
        {
            endpoint: mockEndpoints.dynamicOfferConfig,
            handler: getErrorHandler(
                new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e92', 'Message', '30_011'),
                422
            ),
        },
    ],
};

const capitalFactory = mocksFactory<CapitalGrantOfferPaths & CapitalGrantsPaths & CapitalMissingActionsPaths & OnboardingSessionPaths>();

export const CapitalOfferMockedResponses = capitalFactory({
    ...commonHandlers,
    default: [{ endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER }],
    aprField: [{ endpoint: mockEndpoints.dynamicOfferConfig, response: CAD_CAPITAL_OFFER }],
    errorDynamicOfferConfigNoConfig: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: getHandlerCallback({ response: undefined, status: 204 }) },
    ],
    errorDynamicOfferExceededRetries: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 10)) as any },
    ],
    errorDynamicOfferTemporary: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 1)) as any },
    ],
    errorReviewOfferGeneric: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        {
            endpoint: mockEndpoints.createOffer,
            handler: getErrorHandler(genericError, 500),
            method: 'post',
        },
    ],
    errorRequestFundsGeneric: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(genericError, 500),
            method: 'post',
        },
    ],
    errorRequestFundsGenericWithCode: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
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
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
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
    unqualified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    prequalified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    grantPending: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT] } },
    ],
    grantActions: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] } },
        { endpoint: mockEndpoints.onboardingConfiguration, response: ONBOARDING_CONFIGURATION },
    ],
    anacredit: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_ANACREDIT] } },
        { endpoint: mockEndpoints.onboardingConfiguration, response: ONBOARDING_CONFIGURATION },
    ],
    signTOS: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_SIGN_TOS] } },
        { endpoint: mockEndpoints.onboardingConfiguration, response: ONBOARDING_CONFIGURATION },
    ],
    grantActive: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_GRANT] } },
    ],
    repaymentNL: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT] }],
            },
        },
    ],
    repaymentGB: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_GB_ACCOUNT] }],
            },
        },
    ],
    repaymentUS: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_US_ACCOUNT] }],
            },
        },
    ],
    repaymentNoTransferInstruments: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        {
            endpoint: mockEndpoints.grants,
            response: {
                data: [{ ...ACTIVE_GRANT, unscheduledRepaymentAccounts: [GRANT_NL_ACCOUNT], transferInstruments: [] }],
            },
        },
    ],
    grantFailed: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [FAILED_GRANT] } },
    ],
    grantRepaid: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    grantRevoked: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REVOKED_GRANT] } },
    ],
    grantWrittenOff: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [WRITTEN_OFF_GRANT] } },
    ],
    newOffer: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    grants: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: GRANTS } },
    ],
    errorMissingActionsGeneric: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_SIGN_TOS] } },
        {
            endpoint: mockEndpoints.signToS,
            handler: getErrorHandler(new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message'), 500),
        },
    ],
});
