import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';
import { endpoints } from '../endpoints';

const PREFIX = endpoints.transactions;

export const transactionsMocks = [
    rest.get(PREFIX, (req, res, ctx) => {
        const url = new URL(req.url);

        const balanceAccount = url.searchParams.get('balanceAccountId');
        const accountHolder = url.searchParams.get('accountHolderId');

        const response = BASIC_TRANSACTIONS_LIST.filter(tx => {
            if (balanceAccount && accountHolder) {
                return tx.accountHolderId === accountHolder && tx.balanceAccountId === balanceAccount;
            }
            if (balanceAccount) return tx.balanceAccountId === balanceAccount;
            if (accountHolder) return tx.accountHolderId === accountHolder;
            return tx;
        });

        return res(ctx.json({ data: response }));
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
