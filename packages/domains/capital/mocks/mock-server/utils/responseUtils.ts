import { DefaultBodyType, HttpResponse, JsonBodyType, StrictRequest, StrictResponse } from 'msw';
import { calculateOffers, calculateSelectedOffer } from './offerUtils';
import {
    CAPITAL_STATE_ACTIONS_CASH_ADVANCE,
    CAPITAL_STATE_ACTIONS_LOAN,
    CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE,
    CAPITAL_STATE_SINGLE_ACTION_LOAN,
    DYNAMIC_OFFER_CONFIG_LOAN,
    ACTIONS_CASH_ADVANCE,
    ACTIONS_LOAN,
    SINGLE_ACTION_CASH_ADVANCE,
    SINGLE_ACTION_LOAN,
} from '../../mock-data';
import { ICreateOfferRequest, IContractType } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';

type EndpointState = {
    retriesCount?: number;
    elapsedTimeStart?: number;
};

const ASYNC_ACTION_DELAY_MS = 2000;
const endpointStates: Record<string, EndpointState> = {};

const getEndpointState = (url: string) => (endpointStates[url] ??= {});

const getResponseAfterRetriesLimit = async (
    url: string,
    initialResponse: StrictResponse<JsonBodyType>,
    finalResponse: StrictResponse<JsonBodyType>,
    retriesLimit: number = 0
) => {
    const state = getEndpointState(url);
    const areRetriesExceeded = (state.retriesCount ??= 0) >= retriesLimit;
    state.retriesCount = areRetriesExceeded ? 0 : state.retriesCount + 1;
    return areRetriesExceeded ? finalResponse : initialResponse;
};

const getResponseAfterTimeLimit = async (
    url: string,
    initialResponse: StrictResponse<JsonBodyType>,
    finalResponse: StrictResponse<JsonBodyType>,
    timeLimit: number
) => {
    const testSafeTimeLimit = Number(process.env.TEST_ENV) === 1 ? 0 : timeLimit;
    const state = getEndpointState(url);
    const elapsedTime = Date.now() - (state.elapsedTimeStart ??= Date.now());
    const isElapsedTimeExceeded = elapsedTime >= testSafeTimeLimit;
    if (isElapsedTimeExceeded) state.elapsedTimeStart = undefined;
    return isElapsedTimeExceeded ? finalResponse : initialResponse;
};

export const getGenericError = () => {
    const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message');
    return { ...error };
};

export const getErrorResponse = (error: AdyenPlatformExperienceError, status: number) =>
    HttpResponse.json({ ...error, status, detail: 'detail' }, { status });

export const getAsyncCapitalStateLoanResponse = (url: string) =>
    getResponseAfterTimeLimit(
        url,
        HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_LOAN),
        HttpResponse.json(CAPITAL_STATE_ACTIONS_LOAN),
        ASYNC_ACTION_DELAY_MS
    );

export const getAsyncCapitalStateCashAdvanceResponse = (url: string) =>
    getResponseAfterTimeLimit(
        url,
        HttpResponse.json(CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE),
        HttpResponse.json(CAPITAL_STATE_ACTIONS_CASH_ADVANCE),
        ASYNC_ACTION_DELAY_MS
    );

export const getAsyncGrantsLoanResponse = (url: string) =>
    getResponseAfterTimeLimit(
        url,
        HttpResponse.json({ data: [SINGLE_ACTION_LOAN] }),
        HttpResponse.json({ data: [ACTIONS_LOAN] }),
        ASYNC_ACTION_DELAY_MS
    );

export const getAsyncGrantsCashAdvanceResponse = (url: string) =>
    getResponseAfterTimeLimit(
        url,
        HttpResponse.json({ data: [SINGLE_ACTION_CASH_ADVANCE] }),
        HttpResponse.json({ data: [ACTIONS_CASH_ADVANCE] }),
        ASYNC_ACTION_DELAY_MS
    );

export const getDynamicOfferResponse = (request: StrictRequest<DefaultBodyType>, contractType: IContractType, retriesLimit?: number) => {
    const url = new URL(request.url);
    const { amount, currency } = { amount: url.searchParams.get('amount'), currency: url.searchParams.get('currency') };
    const numberAmount = Number(amount);

    if (!numberAmount || !currency) return;

    const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'ServerError', 'Message', '500');
    const response = calculateOffers(contractType, numberAmount, currency, DYNAMIC_OFFER_CONFIG_LOAN.maxAmount.value);
    return getResponseAfterRetriesLimit(request.url, getErrorResponse(error, 500), HttpResponse.json(response), retriesLimit);
};

export const getCreateOfferResponse = async (request: StrictRequest<DefaultBodyType>, contractType: IContractType) => {
    const { amount, currency, selectedEstimatedRepaymentTermDays } = (await request.json()) as ICreateOfferRequest;
    const offer = calculateSelectedOffer(contractType, amount, currency, selectedEstimatedRepaymentTermDays);
    return HttpResponse.json({ ...offer, id: uuid() });
};
