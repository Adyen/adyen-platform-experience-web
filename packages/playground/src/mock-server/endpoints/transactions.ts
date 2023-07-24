import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';

const PREFIX = '/transactions';

export const transactionsMocks = [
    rest.get(`${PREFIX}`, (req, res, ctx) => {
        return res(ctx.json({ data: BASIC_TRANSACTIONS_LIST }));
    }),
    rest.get(`${PREFIX}/:id`, (req, res, ctx) => {
        const matchingMock = [...BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT].find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Transaction mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
