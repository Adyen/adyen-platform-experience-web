import { ITransaction } from '@adyen/adyen-platform-experience-web';
import { rest } from 'msw';
import { DEFAULT_TRANSACTION, TRANSACTIONS } from '@adyen/adyen-platform-experience-web-mocks';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';
import { compareDates } from './payouts';
import { getPaginationLinks } from './utils';

interface _ITransactionTotals {
    expenses: number;
    incomings: number;
}

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;

const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';
const TRANSACTIONS_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_TOTALS_CACHE = new Map<string, Map<string, _ITransactionTotals>>();

/**
 * Hash function based on {@link https://theartincode.stanis.me/008-djb2/ djb2} algorithm
 */
const computeHash = (...strings: string[]) => {
    const hash = strings.reduce((hash, string) => {
        let i = string.length;
        while (i) hash = (hash * 33) ^ string.charCodeAt(--i);
        return hash;
    }, 5381);
    return (hash >>> 0).toString(16).padStart(8, '0');
};

const fetchTransactionsForRequest = (req: Parameters<Parameters<(typeof rest)['get']>[1]>[0]) => {
    const searchParams = req.url.searchParams;

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
    rest.get(mockEndpoints.transactions, (req, res, ctx) => {
        if (networkError) return res.networkError('Failed to connect');

        if (serverError) {
            return res(
                ctx.status(500),
                ctx.json({
                    type: 'https://docs.adyen.com/errors/forbidden',
                    errorCode: '00_500',
                    title: 'Forbidden',
                    detail: 'Balance Account does not belong to Account Holder',
                    requestId: '769ac4ce59f0f159ad672d38d3291e91',
                    status: 500,
                })
            );
        }

        const cursor = +(req.url.searchParams.get('cursor') ?? 0);
        const limit = +(req.url.searchParams.get('limit') ?? DEFAULT_PAGINATION_LIMIT);
        const responseDelay = 200 + Math.round(Math.floor(Math.random() * 201) / 50) * 50;

        const { transactions } = fetchTransactionsForRequest(req);

        return res(
            delay(responseDelay),
            ctx.json({
                data: transactions.slice(cursor, cursor + limit),
                _links: getPaginationLinks(cursor, limit, transactions.length),
            })
        );
    }),

    rest.get(mockEndpoints.transaction, (req, res, ctx) => {
        const matchingMock = [...TRANSACTIONS, DEFAULT_TRANSACTION].find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Transaction mock'));
            return;
        }

        return res(ctx.json(matchingMock));
    }),

    rest.get(mockEndpoints.transactionsTotals, (req, res, ctx) => {
        // Don't filter transactions by available currencies
        req.url.searchParams.delete('currencies');

        const { hash, transactions } = fetchTransactionsForRequest(req);
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

        return res(ctx.json({ data }));
    }),
];
