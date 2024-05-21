import { rest } from 'msw';
import { DEFAULT_TRANSACTION, TRANSACTIONS, TRANSACTION_TOTALS } from '@adyen/adyen-platform-experience-web-mocks';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';
import { getPaginationLinks } from './utils';

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;
const defaultPaginationLimit = 20;

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

        const categories = req.url.searchParams.getAll('categories');
        const currencies = req.url.searchParams.getAll('currencies');
        const statuses = req.url.searchParams.getAll('statuses');
        const minAmount = req.url.searchParams.get('minAmount');
        const maxAmount = req.url.searchParams.get('maxAmount');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        let transactions = TRANSACTIONS;
        let responseDelay = 200;

        if (categories.length || currencies.length || statuses.length || minAmount || maxAmount) {
            transactions = transactions.filter(
                tx =>
                    (!categories.length || categories!.includes(tx.category)) &&
                    (!currencies.length || currencies!.includes(tx.amount.currency)) &&
                    (!statuses.length || statuses!.includes(tx.status)) &&
                    (!!tx.amount.value || tx.amount.value * 1000 >= Number(minAmount)) &&
                    (!!tx.amount.value || tx.amount.value * 1000 <= Number(maxAmount))
            );

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
        return res(ctx.json({ totals: TRANSACTION_TOTALS }));
    }),
];
