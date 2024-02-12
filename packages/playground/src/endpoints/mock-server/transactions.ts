import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

export const transactionsMocks = [
    rest.get(endpoints.transactions, (req, res, ctx) => {
        return res(delay(500), ctx.json({ transactions: BASIC_TRANSACTIONS_LIST }));
    }),
    rest.get(endpoints.transaction, (req, res, ctx) => {
        const matchingMock = [...BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT].find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Transaction mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
