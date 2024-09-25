import { http, HttpResponse } from 'msw';
import { ITransaction, ITransactionWithDetails } from '../../src';
import { DEFAULT_TRANSACTION, TRANSACTIONS } from '../mock-data';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../../src/utils';
import { compareDates, computeHash, delay, getPaginationLinks } from './utils';
import { endpoints } from '../../endpoints/endpoints';

interface _ITransactionTotals {
    expenses: number;
    incomings: number;
}

const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';
const TRANSACTIONS_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_TOTALS_CACHE = new Map<string, Map<string, _ITransactionTotals>>();

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;

const enrichTransactionDataWithDetails = (
    transaction: ITransaction,
    { feeAmount, refundLocked = false, refundMode = 'FULLY_REFUNDABLE_ONLY' } = EMPTY_OBJECT as {
        feeAmount?: number;
        refundLocked?: boolean;
        refundMode?: ITransactionWithDetails['refundDetails']['refundMode'];
    }
): ITransactionWithDetails => {
    const { currency, value: transactionAmount } = transaction.amount;
    let originalAmount = transactionAmount + Math.max(0, feeAmount ?? 0);
    let lineItems = EMPTY_ARRAY as unknown as ITransactionWithDetails['lineItems'];
    let refundableAmount: number | undefined;

    switch (refundMode) {
        case 'NON_REFUNDABLE':
            refundableAmount = 0;
            refundLocked = false;
            break;
        case 'PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED':
            lineItems = []; // [TODO]: use default line items list
            break;
    }

    return {
        ...transaction,
        lineItems,
        originalAmount: { currency, value: originalAmount },
        refundDetails: {
            refundLocked,
            refundMode,
            refundableAmount: { currency, value: refundableAmount ?? originalAmount },
            refundStatuses: EMPTY_ARRAY as unknown as any[],
        },
    };
};

const fetchTransactionsForRequest = (req: Request) => {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const balanceAccount = searchParams.get('balanceAccountId');
    const categories = searchParams.getAll('categories');
    const createdSince = searchParams.get('createdSince');
    const createdUntil = searchParams.get('createdUntil');
    const currencies = searchParams.getAll('currencies');
    const maxAmount = searchParams.get('maxAmount');
    const minAmount = searchParams.get('minAmount');
    const sortDirection = searchParams.get('sortDirection') ?? DEFAULT_SORT_DIRECTION;
    const statuses = searchParams.getAll('statuses');

    const hash = computeHash(
        [balanceAccount, String(categories), createdSince, createdUntil, String(currencies), maxAmount, minAmount, sortDirection, String(statuses)]
            .filter(Boolean)
            .join(':')
    );

    let transactions = TRANSACTIONS_CACHE.get(hash);

    if (transactions === undefined) {
        const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

        transactions = [...TRANSACTIONS]
            .filter(
                ({ amount, balanceAccountId, category, createdAt, status }) =>
                    balanceAccount &&
                    balanceAccount === balanceAccountId &&
                    (!categories.length || categories.includes(category)) &&
                    (!createdSince || compareDates(createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(createdAt, createdUntil, 'le')) &&
                    (!currencies.length || currencies.includes(amount.currency)) &&
                    (maxAmount === null || amount.value * 1000 <= Number(maxAmount)) &&
                    (minAmount === null || amount.value * 1000 >= Number(minAmount)) &&
                    (!statuses.length || statuses!.includes(status))
            )
            .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);

        TRANSACTIONS_CACHE.set(hash, transactions);
    }

    return { hash, transactions } as const;
};

export const transactionsMocks = [
    http.get(mockEndpoints.transactions, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        if (serverError) {
            return new HttpResponse(
                JSON.stringify({
                    type: 'https://docs.adyen.com/errors/forbidden',
                    errorCode: '00_500',
                    title: 'Forbidden',
                    detail: 'Balance Account does not belong to Account Holder',
                    requestId: '769ac4ce59f0f159ad672d38d3291e91',
                    status: 500,
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const url = new URL(request.url);
        const cursor = +(url.searchParams.get('cursor') ?? 0);
        const limit = +(url.searchParams.get('limit') ?? DEFAULT_PAGINATION_LIMIT);
        const responseDelay = 200 + Math.round(Math.floor(Math.random() * 201) / 50) * 50;

        const { transactions } = fetchTransactionsForRequest(request);

        await delay(responseDelay);
        return HttpResponse.json({
            data: transactions.slice(cursor, cursor + limit),
            _links: getPaginationLinks(cursor, limit, transactions.length),
        });
    }),

    http.get(mockEndpoints.transaction, async ({ params }) => {
        const matchingMock = [...TRANSACTIONS, DEFAULT_TRANSACTION].find(mock => mock.id === params.id);

        if (!matchingMock) {
            HttpResponse.text('Cannot find matching Transaction mock', { status: 404 });
            return;
        }
        await delay(1000);
        return HttpResponse.json(enrichTransactionDataWithDetails(matchingMock));
    }),

    http.get(mockEndpoints.transactionsTotals, ({ request }) => {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // Don't filter transactions within the same time window
        searchParams.delete('categories');
        searchParams.delete('currencies');
        searchParams.delete('maxAmount');
        searchParams.delete('minAmount');
        searchParams.delete('sortDirection');
        searchParams.delete('statuses');

        const { hash, transactions } = fetchTransactionsForRequest(request);
        let totals = TRANSACTIONS_TOTALS_CACHE.get(hash);

        if (totals === undefined) {
            totals = transactions.reduce((currencyTotalsMap, transaction) => {
                const { value: amount, currency } = transaction.amount;
                let currencyTotals = currencyTotalsMap.get(currency);

                if (currencyTotals === undefined) {
                    currencyTotalsMap.set(currency, (currencyTotals = { expenses: 0, incomings: 0 }));
                }

                currencyTotals[amount >= 0 ? 'incomings' : 'expenses'] += amount;
                return currencyTotalsMap;
            }, new Map<string, _ITransactionTotals>());

            TRANSACTIONS_TOTALS_CACHE.set(hash, totals);
        }

        const data: (_ITransactionTotals & { currency: string })[] = [];

        for (const [currency, currencyTotals] of totals) {
            data.push({ currency, ...currencyTotals });
        }

        return HttpResponse.json({ data });
    }),
];
