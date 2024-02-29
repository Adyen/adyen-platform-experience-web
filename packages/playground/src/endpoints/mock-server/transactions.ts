import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const mockEndpoints = endpoints('mock');
const networkError = false;

export const transactionsMocks = [
    rest.get(mockEndpoints.transactions, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const categories = req.url.searchParams.getAll('categories');
        const currencies = req.url.searchParams.getAll('currencies');
        const statuses = req.url.searchParams.getAll('statuses');

        let transactions = BASIC_TRANSACTIONS_LIST;
        let responseDelay = 200;

        if (categories.length || currencies.length || statuses.length) {
            transactions = transactions.filter(
                tx =>
                    (!categories.length || categories!.includes(tx.category)) &&
                    (!currencies.length || currencies!.includes(tx.amount.currency)) &&
                    (!statuses.length || statuses!.includes(tx.status))
            );

            responseDelay = 400;
        }

        return res(delay(responseDelay), ctx.json({ transactions }));
    }),

    rest.get(mockEndpoints.transaction, (req, res, ctx) => {
        const matchingMock = [...BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT].find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Transaction mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
