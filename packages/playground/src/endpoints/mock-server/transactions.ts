import { ITransaction } from '@adyen/adyen-platform-experience-web';
import { rest } from 'msw';
import { DEFAULT_TRANSACTION, TRANSACTIONS, TRANSACTION_TOTALS } from '@adyen/adyen-platform-experience-web-mocks';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';
import { compareDates } from './payouts';
import { getPaginationLinks } from './utils';

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;
const defaultPaginationLimit = 20;

/**
 * Hash function based on {@link https://theartincode.stanis.me/008-djb2/ djb2} algorithm
 */
const hash = (...strings: string[]) => {
    const hash = strings.reduce((hash, string) => {
        let i = string.length;
        while (i) hash = (hash * 33) ^ string.charCodeAt(--i);
        return hash;
    }, 5381);
    return (hash >>> 0).toString(16).padStart(8, '0');
};

export const transactionsMocks = [
    rest.get(mockEndpoints.transactions, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

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

        const balanceAccount = req.url.searchParams.get('balanceAccountId');
        const categories = req.url.searchParams.getAll('categories');
        const currencies = req.url.searchParams.getAll('currencies');
        const statuses = req.url.searchParams.getAll('statuses');
        const minAmount = req.url.searchParams.get('minAmount');
        const maxAmount = req.url.searchParams.get('maxAmount');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');
        const sortDirection = req.url.searchParams.get('sortDirection');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        let transactions = [...TRANSACTIONS];
        let responseDelay = 200;

        if (categories.length || currencies.length || statuses.length || minAmount || maxAmount || sortDirection) {
            transactions = transactions.filter(
                tx =>
                    !!balanceAccount &&
                    tx.balanceAccountId === balanceAccount &&
                    (!categories.length || categories!.includes(tx.category)) &&
                    (!currencies.length || currencies!.includes(tx.amount.currency)) &&
                    (!statuses.length || statuses!.includes(tx.status)) &&
                    (!createdSince || compareDates(tx.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(tx.createdAt, createdUntil, 'le')) &&
                    (!!tx.amount.value || tx.amount.value * 1000 >= Number(minAmount)) &&
                    (!!tx.amount.value || tx.amount.value * 1000 <= Number(maxAmount))
            );

            const direction = sortDirection === 'desc' ? -1 : 1;

            transactions.sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);

            responseDelay = 400;
        }

        const data = transactions.slice(cursor, cursor + limit);

        return res(delay(responseDelay), ctx.json({ data, _links: getPaginationLinks(cursor, limit, transactions.length) }));
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
        let transactions = [...TRANSACTIONS];
        const balanceAccount = req.url.searchParams.get('balanceAccountId');
        const categories = req.url.searchParams.getAll('categories');
        const currencies = req.url.searchParams.getAll('currencies');
        const statuses = req.url.searchParams.getAll('statuses');
        const minAmount = req.url.searchParams.get('minAmount');
        const maxAmount = req.url.searchParams.get('maxAmount');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');
        const sortDirection = req.url.searchParams.get('sortDirection');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        const balanceKey = balanceAccount ?? 'na';
        const categoryKey = categories.toString() ?? 'na';
        const createdSinceKey = !!createdSince ? new Date(createdSince).getDate().toString() : 'na';
        const createdUntilKey = !!createdUntil ? new Date(createdUntil).getDate().toString() : 'na';
        const currenciesKey = currencies.toString() ?? 'na';
        const maxAmountKey = maxAmount ?? 'na';
        const minAmountKey = minAmount ?? 'na';

        const hashedKey = hash(balanceKey, categoryKey, createdSinceKey, createdUntilKey, currenciesKey, maxAmountKey, minAmountKey);

        if (categories.length || currencies.length || statuses.length || minAmount || maxAmount || sortDirection) {
            transactions = transactions.filter(
                tx =>
                    !!balanceAccount &&
                    tx.balanceAccountId === balanceAccount &&
                    (!categories.length || categories!.includes(tx.category)) &&
                    (!currencies.length || currencies!.includes(tx.amount.currency)) &&
                    (!statuses.length || statuses!.includes(tx.status)) &&
                    (!createdSince || compareDates(tx.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(tx.createdAt, createdUntil, 'le')) &&
                    (!!tx.amount.value || tx.amount.value * 1000 >= Number(minAmount)) &&
                    (!!tx.amount.value || tx.amount.value * 1000 <= Number(maxAmount))
            );
        }

        const totals = transactions.reduce((acc: Map<string, { incomings?: number; expenses?: number }>, transaction: ITransaction) => {
            const { amount } = transaction;
            const currentCur = acc.get(amount.currency);
            let val = {};
            if (currentCur) {
                if (amount.value > 0) {
                    val = currentCur.incomings
                        ? { ...currentCur, incomings: currentCur.incomings + amount.value }
                        : { ...currentCur, incomings: amount.value };
                } else {
                    val = currentCur.expenses
                        ? { ...currentCur, expenses: currentCur.expenses + amount.value }
                        : { ...currentCur, expenses: amount.value };
                }
            }
            acc.set(amount.currency, val);
            return acc;
        }, new Map());
        const keys = totals.keys();
        let totalsResp = [];
        for (const key of keys) {
            const totalVals = totals.get(key);
            totalsResp.push({ expenses: 0, incomings: 0, currency: key, ...totalVals });
        }
        return res(ctx.json({ data: totalsResp }));
    }),
];
