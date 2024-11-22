import {
    ACTIVE_GRANT,
    DYNAMIC_CAPITAL_OFFER,
    FAILED_GRANT,
    GRANT_OFFER,
    PENDING_GRANT,
    PENDING_GRANT_WITH_ACTIONS,
    REPAID_GRANT,
    REVOKED_GRANT,
    SIGNED_OFFER,
    SIGN_TOS_ACTION_DETAILS,
    WRITTEN_OFF_GRANT,
} from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';
import { calculateGrant, delay } from './utils/utils';
import { getHandlerCallback, mocksFactory } from './utils/mocksHandlerFactory';
import { paths as CapitalPaths } from '../../src/types/api/resources/CapitalResource';
import uuid from '../../src/utils/random/uuid';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';

const mockEndpoints = endpoints('mock').capital;
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
        return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
    }),
    http.get(mockEndpoints.grants, EMPTY_GRANTS_LIST),
    http.get(mockEndpoints.dynamicOffer, DYNAMIC_OFFER_HANDLER),
    http.post(mockEndpoints.createOffer, OFFER_REVIEW_HANDLER),
    http.post(mockEndpoints.requestFunds, getHandlerCallback({ response: SIGNED_OFFER, delayTime: 800 })),
];
const capitalFactory = mocksFactory<CapitalPaths>();

const getErrorHandler = (error: AdyenPlatformExperienceError, status = 500) => {
    return async () => {
        await delay(300);
        return HttpResponse.json({ ...error, status, detail: 'detail' }, { status });
    };
};

const ERROR_NO_CAPABILITY = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingCapabilitiesException', 'Message', '30_016');

const ERROR_INACTIVE_AH = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'AccountHolderInactiveException', 'Message', '30_011');

const ERROR_OFFER_REVIEW_WENT_WRONG = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
const ERROR_NO_GRANT_ACCOUNT_CONFIG = new AdyenPlatformExperienceError(
    ErrorTypes.ERROR,
    'GrantAccountMisconfigurationException',
    'Message',
    '30_600'
);
const ERROR_NO_PRIMARY_BALANCE_ACCOUNT = new AdyenPlatformExperienceError(
    ErrorTypes.ERROR,
    'MissingPrimaryBalanceAccountException',
    'Message',
    '30_013'
);
const ERROR_EXCEEDED_GRANT_LIMIT = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'MissingPrimaryBalanceAccountException', 'Message');
const ERROR_MISSING_ACTIONS = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');

export const CapitalMockedResponses = capitalFactory({
    unqualified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    prequalified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    activeGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_GRANT] } },
    ],
    failedGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [FAILED_GRANT] } },
    ],
    pendingGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT] } },
    ],
    pendingGrantWithActions: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_ACTIONS] } },
        { endpoint: mockEndpoints.signToS, response: SIGN_TOS_ACTION_DETAILS },
    ],
    repaidGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    revokedGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REVOKED_GRANT] } },
    ],
    writtenOffGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [WRITTEN_OFF_GRANT] } },
    ],
    grantOffer: [{ endpoint: mockEndpoints.dynamicOffer, response: GRANT_OFFER }],
    errorNoCapability: [
        {
            endpoint: mockEndpoints.dynamicOfferConfig,
            handler: getErrorHandler(ERROR_NO_CAPABILITY, 422),
        },
    ],
    errorInactiveAccountHolder: [
        {
            endpoint: mockEndpoints.dynamicOfferConfig,
            handler: getErrorHandler(ERROR_INACTIVE_AH, 422),
        },
    ],
    reviewOfferWentWrong: [
        {
            endpoint: mockEndpoints.createOffer,
            handler: getErrorHandler(ERROR_OFFER_REVIEW_WENT_WRONG, 500),
            method: 'post',
        },
    ],
    missingPrimaryBalanceAccount: [
        {
            endpoint: mockEndpoints.createOffer,
            handler: ((req: any) => OFFER_REVIEW_HANDLER(req)) as any,
            method: 'post',
        },
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(ERROR_NO_PRIMARY_BALANCE_ACCOUNT, 422),
            method: 'post',
        },
    ],
    noGrantAccountConfig: [
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(ERROR_NO_GRANT_ACCOUNT_CONFIG, 500),
            method: 'post',
        },
    ],
    requestFundGenericError: [
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(new AdyenPlatformExperienceError(ErrorTypes.ERROR, '1234', 'Message', '500'), 500),
            method: 'post',
        },
    ],
    exceededGrantLimit: [
        {
            endpoint: mockEndpoints.requestFunds as any,
            handler: getErrorHandler(ERROR_EXCEEDED_GRANT_LIMIT, 422),
            method: 'post',
        },
    ],
    noOfferAvailable: [{ endpoint: mockEndpoints.dynamicOfferConfig, handler: getHandlerCallback({ response: undefined, status: 204 }) }],
    hasActiveGrants: [{ endpoint: mockEndpoints.dynamicOfferConfig, handler: getHandlerCallback({ response: undefined, status: 204 }) }],
    dynamicOfferServerError: [{ endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 1)) as any }],
    dynamicOfferExceededRetries: [{ endpoint: mockEndpoints.dynamicOffer, handler: ((req: any) => DYNAMIC_OFFER_HANDLER(req, 10)) as any }],
    missingActionsError: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT_WITH_ACTIONS] } },
        { endpoint: mockEndpoints.signToS, handler: getErrorHandler(ERROR_MISSING_ACTIONS, 500) },
    ],
});
