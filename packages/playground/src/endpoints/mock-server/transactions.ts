import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const mockEndpoints = endpoints('mock');
const networkError = true;

export const transactionsMocks = [
    rest.get(mockEndpoints.transactions, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }
        let transactions = BASIC_TRANSACTIONS_LIST;

        const categories = req.url.searchParams.getAll('categories');
        const statuses = req.url.searchParams.getAll('statuses');

        if (categories.length && statuses.length) {
            return res(
                delay(200),
                ctx.json({ transactions: transactions.filter(tx => categories.includes(tx.category) && statuses.includes(tx.status)) })
            );
        } else {
            if (categories.length) {
                transactions = transactions.filter(tx => categories.includes(tx.category));
            }
            if (statuses.length) {
                transactions = transactions.filter(tx => statuses.includes(tx.status));
            }
        }

        return res(delay(400), ctx.json({ transactions }));
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
