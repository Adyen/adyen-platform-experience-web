import { rest } from 'msw';
import { BALANCE_ACCOUNTS } from '../../../../../../mocks/src/balanceAccounts';

const PREFIX = '/balanceAccounts';

export const balanceAccountMocks = [
    rest.get(`${PREFIX}/:id`, (req, res, ctx) => {
        const matchingMock = BALANCE_ACCOUNTS.find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Balance Account mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
