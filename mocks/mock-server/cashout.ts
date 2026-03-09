import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';
import {
    CASHOUT_CONFIGURATION,
    CASHOUT_CONFIGURATION_UNAVAILABLE_ZERO_BALANCE,
    CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_CURRENCY,
    CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_REGION,
    CASHOUT_CONFIGURATION_UNAVAILABLE_NO_TRANSFER_INSTRUMENTS,
    CASHOUT_CONFIGURATION_UNAVAILABLE_COOLDOWN,
    CASHOUT_CONFIGURATION_UNAVAILABLE_DAILY_LIMIT,
    CASHOUT_CONFIGURATION_UNAVAILABLE_CAPABILITY,
    CASHOUT_CONFIGURATION_UNAVAILABLE_RISK,
    CASHOUT_BALANCE_ACCOUNTS,
    CASHOUT_FEES,
    CASHOUT_TRANSFER_INSTRUMENTS,
    CASHOUT_SUBMIT_SUCCESS,
    CASHOUT_HISTORY,
} from '../mock-data/cashout';

const mockEndpoints = endpoints().cashout;
const networkError = false;

const validationError = (fields: string[]) =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '29_001',
            title: 'The request is missing required fields or contains invalid data.',
            detail: `'${fields.join("', '")}' is required.`,
            requestId: '00000000000000000000000000000000',
            status: 422,
        },
        { status: 422 }
    );

const requireAccountKey = (request: Request) => {
    const url = new URL(request.url);
    const accountKey = url.searchParams.get('accountKey');
    if (!accountKey) return { error: validationError(['accountKey']) };
    return { accountKey };
};

export const cashoutMocks = [
    http.get(mockEndpoints.configuration, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const result = requireAccountKey(request);
        if ('error' in result) return result.error;

        await delay(300);
        return HttpResponse.json({ ...CASHOUT_CONFIGURATION, accountKey: result.accountKey });
    }),

    http.get(mockEndpoints.balanceAccounts, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const result = requireAccountKey(request);
        if ('error' in result) return result.error;

        await delay(300);
        return HttpResponse.json(CASHOUT_BALANCE_ACCOUNTS);
    }),

    http.get(mockEndpoints.fees, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const url = new URL(request.url);
        const accountKey = url.searchParams.get('accountKey');
        const amount = url.searchParams.get('amount');
        const currency = url.searchParams.get('currency');

        if (!accountKey || !amount || !currency) {
            const missingFields = [!accountKey && 'accountKey', !amount && 'amount', !currency && 'currency'].filter(Boolean) as string[];
            return validationError(missingFields);
        }

        const amountValue = Number(amount);
        const feesValue = Math.round(amountValue * 0.02);
        const amountToReceive = amountValue - feesValue;

        await delay(300);
        return HttpResponse.json({
            totalAmount: { value: amountValue, currency },
            feesAmount: { value: feesValue, currency },
            amountToReceive: { value: amountToReceive, currency },
        });
    }),

    http.get(mockEndpoints.transferInstruments, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const result = requireAccountKey(request);
        if ('error' in result) return result.error;

        await delay(300);
        return HttpResponse.json(CASHOUT_TRANSFER_INSTRUMENTS);
    }),

    http.post(mockEndpoints.submit, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const body = (await request.json()) as {
            accountKey?: string;
            amount?: { value?: number; currency?: string };
            transferInstrumentId?: string;
        };

        if (!body.accountKey || !body.amount?.value || !body.amount?.currency || !body.transferInstrumentId) {
            const missingFields = [
                !body.accountKey && 'accountKey',
                !body.amount?.value && 'amount.value',
                !body.amount?.currency && 'amount.currency',
                !body.transferInstrumentId && 'transferInstrumentId',
            ].filter(Boolean) as string[];
            return validationError(missingFields);
        }

        await delay(500);
        return HttpResponse.json(CASHOUT_SUBMIT_SUCCESS);
    }),

    http.get(mockEndpoints.history, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const result = requireAccountKey(request);
        if ('error' in result) return result.error;

        await delay(300);
        return HttpResponse.json(CASHOUT_HISTORY);
    }),
];

type GetHttpError = AdyenPlatformExperienceError & { status: number; detail: string };

const getErrorHandler = (error: AdyenPlatformExperienceError, status = 500) => {
    return async () => {
        await delay(300);
        return HttpResponse.json({ ...error, status, detail: 'detail' } as GetHttpError, { status });
    };
};

const genericError500 = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Something went wrong', 'Message', '00_500');
const forbiddenError = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Forbidden', 'Message', '00_403');
const entityNotFoundError = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'Entity was not found', 'Message', '30_112');

const createConfigHandler = (response: object) => ({
    handlers: [
        http.get(mockEndpoints.configuration, async () => {
            await delay(300);
            return HttpResponse.json(response);
        }),
    ],
});

export const CASHOUT_CONFIGURATION_HANDLERS = {
    default: createConfigHandler(CASHOUT_CONFIGURATION),
    unavailableZeroBalance: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_ZERO_BALANCE),
    unavailableUnsupportedCurrency: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_CURRENCY),
    unavailableUnsupportedRegion: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_REGION),
    unavailableNoTransferInstruments: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_NO_TRANSFER_INSTRUMENTS),
    unavailableCooldown: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_COOLDOWN),
    unavailableDailyLimit: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_DAILY_LIMIT),
    unavailableCapability: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_CAPABILITY),
    unavailableRisk: createConfigHandler(CASHOUT_CONFIGURATION_UNAVAILABLE_RISK),
    forbidden: {
        handlers: [http.get(mockEndpoints.configuration, getErrorHandler(forbiddenError, 403))],
    },
    internalServerError: {
        handlers: [http.get(mockEndpoints.configuration, getErrorHandler(genericError500, 500))],
    },
    networkError: {
        handlers: [http.get(mockEndpoints.configuration, () => HttpResponse.error())],
    },
};

export const CASHOUT_SUBMIT_HANDLERS = {
    success: {
        handlers: [
            http.post(mockEndpoints.submit, async () => {
                await delay(500);
                return HttpResponse.json(CASHOUT_SUBMIT_SUCCESS);
            }),
        ],
    },
    forbidden: {
        handlers: [http.post(mockEndpoints.submit, getErrorHandler(forbiddenError, 403))],
    },
    validationError: {
        handlers: [
            http.post(mockEndpoints.submit, async () => {
                await delay(300);
                return validationError(['balanceAccountId']);
            }),
        ],
    },
    entityNotFound: {
        handlers: [http.post(mockEndpoints.submit, getErrorHandler(entityNotFoundError, 422))],
    },
    internalServerError: {
        handlers: [http.post(mockEndpoints.submit, getErrorHandler(genericError500, 500))],
    },
    networkError: {
        handlers: [http.post(mockEndpoints.submit, () => HttpResponse.error())],
    },
};

export const CASHOUT_FEES_HANDLERS = {
    default: {
        handlers: [
            http.get(mockEndpoints.fees, async () => {
                await delay(300);
                return HttpResponse.json(CASHOUT_FEES);
            }),
        ],
    },
    internalServerError: {
        handlers: [http.get(mockEndpoints.fees, getErrorHandler(genericError500, 500))],
    },
    networkError: {
        handlers: [http.get(mockEndpoints.fees, () => HttpResponse.error())],
    },
};

export const CASHOUT_TRANSFER_INSTRUMENTS_HANDLERS = {
    default: {
        handlers: [
            http.get(mockEndpoints.transferInstruments, async () => {
                await delay(300);
                return HttpResponse.json(CASHOUT_TRANSFER_INSTRUMENTS);
            }),
        ],
    },
    empty: {
        handlers: [
            http.get(mockEndpoints.transferInstruments, async () => {
                await delay(300);
                return HttpResponse.json({ data: [] });
            }),
        ],
    },
    internalServerError: {
        handlers: [http.get(mockEndpoints.transferInstruments, getErrorHandler(genericError500, 500))],
    },
    networkError: {
        handlers: [http.get(mockEndpoints.transferInstruments, () => HttpResponse.error())],
    },
};

export const CASHOUT_HISTORY_HANDLERS = {
    default: {
        handlers: [
            http.get(mockEndpoints.history, async () => {
                await delay(300);
                return HttpResponse.json(CASHOUT_HISTORY);
            }),
        ],
    },
    empty: {
        handlers: [
            http.get(mockEndpoints.history, async () => {
                await delay(300);
                return HttpResponse.json([]);
            }),
        ],
    },
    internalServerError: {
        handlers: [http.get(mockEndpoints.history, getErrorHandler(genericError500, 500))],
    },
    networkError: {
        handlers: [http.get(mockEndpoints.history, () => HttpResponse.error())],
    },
};
