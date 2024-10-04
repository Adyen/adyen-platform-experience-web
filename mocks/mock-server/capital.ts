import {
    ACTIVE_GRANT,
    ACTIVE_UNREPAID_GRANT,
    DYNAMIC_CAPITAL_OFFER,
    FAILED_GRANT,
    PENDING_GRANT,
    REPAID_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
    GRANT_OFFER,
} from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';
import { delay } from './utils/utils';
import { getHandlerCallback, mocksFactory } from './utils/mocksHandlerFactory';
import { paths as CapitalPaths } from '../../src/types/api/resources/CapitalResource';
import uuid from '../../src/utils/random/uuid';
import { IGrantOfferResponseDTO } from '../../src';

const mockEndpoints = endpoints('mock').capital;
const networkError = false;

const EMPTY_GRANTS_LIST = getHandlerCallback({
    response: {
        data: [],
    },
});

const EMPTY_OFFER = getHandlerCallback({ response: {} });

const OFFER_REVIEW_HANDLER = async ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const params =
        searchParams && searchParams.size ? { amount: searchParams.get('amount'), currency: searchParams.get('currency') } : await request.json();

    const { amount, currency } = params as {
        amount: number;
        currency: string;
    };

    const feesAmount = Math.round(Number(amount) * 0.11 * 100) / 100;
    const totalAmount = Number(amount) + feesAmount;

    const repaymentFrequencyDays = 30;
    const numberOfRepayments = Math.floor(365 / repaymentFrequencyDays);
    const minimumRepayment = Number(totalAmount / numberOfRepayments);

    const response = {
        id: uuid(),
        grantAmount: {
            value: amount,
            currency: currency,
        },
        feesAmount: {
            value: feesAmount,
            currency: currency,
        },
        totalAmount: {
            value: totalAmount,
            currency: currency,
        },
        thresholdAmount: {
            value: minimumRepayment,
            currency: currency,
        },
        repaymentRate: 11,
        expectedRepaymentPeriodDays: 365,
        maximumRepaymentPeriodDays: 540,
    } satisfies IGrantOfferResponseDTO;

    await delay(800);
    return HttpResponse.json(response);
};

export const capitalMock = [
    http.get(mockEndpoints.dynamicOfferConfig, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
    }),
    http.get(mockEndpoints.grants, EMPTY_GRANTS_LIST),
    http.get(mockEndpoints.dynamicOffer, OFFER_REVIEW_HANDLER),
    http.post(mockEndpoints.offerReview, OFFER_REVIEW_HANDLER),
];
const capitalFactory = mocksFactory<CapitalPaths>();

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
    activeUnrepaidGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_UNREPAID_GRANT] } },
    ],
    failedGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [FAILED_GRANT] } },
    ],
    pendingGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT] } },
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
});
