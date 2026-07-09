import { DefaultBodyType, HttpResponse, JsonBodyType, StrictRequest, StrictResponse } from 'msw';
import { calculateOffers, calculateSelectedOffer } from './offerUtils';
import {
    CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION,
    DYNAMIC_CAPITAL_OFFER,
    PENDING_GRANT_WITH_MULTIPLE_ACTIONS,
    PENDING_GRANT_WITH_SINGLE_ACTION,
} from '../../mock-data/capital';
import { ICreateGrantOfferRequest } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';

let retriesCount = 0;
let elapsedTimeStart: number | undefined;
const ASYNC_ACTION_DELAY_MS = 2000;

const getResponseAfterRetriesLimit = async (
    initialResponse: StrictResponse<JsonBodyType>,
    finalResponse: StrictResponse<JsonBodyType>,
    retriesLimit: number = 0
) => {
    const areRetriesExceeded = retriesCount >= retriesLimit;
    if (areRetriesExceeded) {
        retriesCount = 0;
    } else {
        retriesCount += 1;
    }
    return areRetriesExceeded ? finalResponse : initialResponse;
};

const getResponseAfterTimeLimit = async (
    initialResponse: StrictResponse<JsonBodyType>,
    finalResponse: StrictResponse<JsonBodyType>,
    timeLimit: number
) => {
    const testSafeTimeLimit = Number(process.env.TEST_ENV) === 1 ? 0 : timeLimit;
    if (!elapsedTimeStart) elapsedTimeStart = Date.now();
    const elapsedTime = Date.now() - elapsedTimeStart;
    const isElapsedTimeExceeded = elapsedTime >= testSafeTimeLimit;
    if (isElapsedTimeExceeded) elapsedTimeStart = undefined;
    return isElapsedTimeExceeded ? finalResponse : initialResponse;
};

export const getGenericError = () => {
    const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
    return { ...error };
};

export const getErrorResponse = (error: AdyenPlatformExperienceError, status: number) =>
    HttpResponse.json({ ...error, status, detail: 'detail' }, { status });

export const getAsyncCapitalStateResponse = () =>
    getResponseAfterTimeLimit(
        HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_SINGLE_ACTION),
        HttpResponse.json(CAPITAL_STATE_PENDING_GRANT_WITH_MULTIPLE_ACTIONS),
        ASYNC_ACTION_DELAY_MS
    );

export const getAsyncGrantsResponse = () =>
    getResponseAfterTimeLimit(
        HttpResponse.json({ data: [PENDING_GRANT_WITH_SINGLE_ACTION] }),
        HttpResponse.json({ data: [PENDING_GRANT_WITH_MULTIPLE_ACTIONS] }),
        ASYNC_ACTION_DELAY_MS
    );

export const getDynamicOfferResponse = (request: StrictRequest<DefaultBodyType>, retriesLimit?: number) => {
    const url = new URL(request.url);
    const { amount, currency } = { amount: url.searchParams.get('amount'), currency: url.searchParams.get('currency') };
    const numberAmount = Number(amount);

    if (!numberAmount || !currency) return;

    const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'ServerError', 'Message', '500');
    const response = calculateOffers(numberAmount, currency, DYNAMIC_CAPITAL_OFFER.maxAmount.value);
    return getResponseAfterRetriesLimit(getErrorResponse(error, 500), HttpResponse.json(response), retriesLimit);
};

export const getCreateOfferResponse = async (request: StrictRequest<DefaultBodyType>) => {
    const { amount, currency, selectedEstimatedRepaymentTermDays } = (await request.json()) as ICreateGrantOfferRequest;
    const offer = calculateSelectedOffer(amount, currency, selectedEstimatedRepaymentTermDays);
    return HttpResponse.json({ ...offer, id: uuid() });
};
