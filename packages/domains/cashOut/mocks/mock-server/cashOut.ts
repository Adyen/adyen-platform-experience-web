import { http, HttpResponse } from 'msw';
import type { ICashOutFees, ICashOutRequest, ICashOutResponse } from '@integration-components/types';
import { delay } from '@integration-components/testing/msw';
import { uuid } from '@integration-components/utils';
import { ENDPOINTS } from '../endpoints';
import { ELIGIBILITY_AVAILABLE, ELIGIBILITY_BY_BALANCE_ACCOUNT, ELIGIBILITY_UNAVAILABLE } from '../mock-data/cashOut';

const REQUEST_ID = '769ac4ce59f0f159ad672d38d3291e93';
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
// Java's `\p{Alnum}` in the backend pattern is ASCII-only.
const TRANSFER_INSTRUMENT_ID_PATTERN = /^[A-Za-z0-9]+$/;

const NOT_NULL_MESSAGE = 'Required parameter. Must not be null';
const POSITIVE_MESSAGE = 'Must be a positive number';
const CURRENCY_CODE_MESSAGE = 'Must be a valid ISO 4217 currency code';

type InvalidField = { name: string; value: string; message: string };

const calculateFees = (value: number, currency: string): ICashOutFees => {
    // An arbitrary rule (0.50 + 1.5%): the component only reads the response, never how the fee was derived.
    const feeValue = Math.min(value, 50 + Math.round((value * 150) / 10_000));

    return {
        amount: { currency, value },
        fee: { currency, value: feeValue },
        payoutAmount: { currency, value: value - feeValue },
    };
};

const getAmountErrors = (amount: number | undefined): InvalidField[] => {
    if (amount === undefined) return [{ name: 'amount', value: '', message: NOT_NULL_MESSAGE }];
    if (!Number.isInteger(amount) || amount <= 0) return [{ name: 'amount', value: String(amount), message: POSITIVE_MESSAGE }];
    return [];
};

const getCurrencyErrors = (currency: string | undefined): InvalidField[] => {
    if (currency === undefined) return [{ name: 'currency', value: '', message: NOT_NULL_MESSAGE }];
    if (!CURRENCY_CODE_PATTERN.test(currency)) return [{ name: 'currency', value: currency, message: CURRENCY_CODE_MESSAGE }];
    return [];
};

const getTransferInstrumentIdErrors = (transferInstrumentId: string | undefined): InvalidField[] => {
    const name = 'counterparty.transferInstrumentId';
    if (transferInstrumentId === undefined) return [{ name, value: '', message: NOT_NULL_MESSAGE }];
    if (!TRANSFER_INSTRUMENT_ID_PATTERN.test(transferInstrumentId)) return [{ name, value: transferInstrumentId, message: 'Must be alphanumeric' }];
    return [];
};

// Mirrors `RestServiceErrors.VALIDATION`, which the backend returns for bean validation failures.
const getValidationErrorResponse = (invalidFields: InvalidField[]) =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '29_001',
            title: 'The request is missing required fields or contains invalid data.',
            status: 422,
            requestId: REQUEST_ID,
            invalidFields,
        },
        { status: 422 }
    );

const getInternalServerErrorResponse = () =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/internal',
            errorCode: '00_500',
            title: 'An internal error happened',
            status: 500,
            requestId: REQUEST_ID,
        },
        { status: 500 }
    );

export const cashOutMocks = [
    http.get<{ accountKey: string }>(ENDPOINTS.eligibility, async ({ params }) => {
        await delay();
        return HttpResponse.json(ELIGIBILITY_BY_BALANCE_ACCOUNT[params.accountKey] ?? ELIGIBILITY_AVAILABLE.default);
    }),
    http.get(ENDPOINTS.fees, async ({ request }) => {
        const { searchParams } = new URL(request.url);
        const amountParam = searchParams.get('amount');
        const amount = amountParam === null ? undefined : Number(amountParam);
        const currency = searchParams.get('currency') ?? undefined;
        const invalidFields = [...getAmountErrors(amount), ...getCurrencyErrors(currency)];

        await delay(200);

        if (amount === undefined || currency === undefined || invalidFields.length > 0) {
            return getValidationErrorResponse(invalidFields);
        }

        return HttpResponse.json(calculateFees(amount, currency));
    }),
    http.post<{ accountKey: string }, Partial<ICashOutRequest>>(ENDPOINTS.instruct, async ({ params, request }) => {
        const { amount, counterparty, currency, description, referenceForBeneficiary } = await request.json();
        const transferInstrumentId = counterparty?.transferInstrumentId;
        const invalidFields = [...getAmountErrors(amount), ...getCurrencyErrors(currency), ...getTransferInstrumentIdErrors(transferInstrumentId)];

        await delay(800);

        if (amount === undefined || currency === undefined || transferInstrumentId === undefined || invalidFields.length > 0) {
            return getValidationErrorResponse(invalidFields);
        }

        const response: ICashOutResponse = {
            id: uuid(),
            balanceAccount: params.accountKey,
            amount: { currency, value: amount },
            fee: calculateFees(amount, currency).fee,
            counterparty: { transferInstrumentId },
            ...(description === undefined ? {} : { description }),
            ...(referenceForBeneficiary === undefined ? {} : { referenceForBeneficiary }),
        };

        return HttpResponse.json(response);
    }),
];

export const CASH_OUT_HANDLERS = {
    default: { handlers: cashOutMocks },
    singleTransferInstrument: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_AVAILABLE.singleTransferInstrument);
            }),
        ],
    },
    withIneligibleTransferInstruments: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_AVAILABLE.withIneligibleTransferInstruments);
            }),
        ],
    },
    zeroBalance: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.zeroBalance);
            }),
        ],
    },
    noInstantReachableTransferInstruments: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.noInstantReachableTransferInstruments);
            }),
        ],
    },
    cashOutInProgress: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.cashOutInProgress);
            }),
        ],
    },
    dailyLimitReached: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.dailyLimitReached);
            }),
        ],
    },
    sendToBalanceAccountNotAllowed: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.sendToBalanceAccountNotAllowed);
            }),
        ],
    },
    receiveFromBalanceAccountNotAllowed: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.receiveFromBalanceAccountNotAllowed);
            }),
        ],
    },
    riskRestricted: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.riskRestricted);
            }),
        ],
    },
    cashOutNotConfigured: {
        handlers: [
            http.get(ENDPOINTS.eligibility, async () => {
                await delay();
                return HttpResponse.json(ELIGIBILITY_UNAVAILABLE.cashOutNotConfigured);
            }),
        ],
    },
    eligibilityInternalServerError: { handlers: [http.get(ENDPOINTS.eligibility, getInternalServerErrorResponse)] },
    eligibilityNetworkError: { handlers: [http.get(ENDPOINTS.eligibility, () => HttpResponse.error())] },
    feesInternalServerError: { handlers: [http.get(ENDPOINTS.fees, getInternalServerErrorResponse)] },
    instructInternalServerError: { handlers: [http.post(ENDPOINTS.instruct, getInternalServerErrorResponse)] },
    instructNetworkError: { handlers: [http.post(ENDPOINTS.instruct, () => HttpResponse.error())] },
};
