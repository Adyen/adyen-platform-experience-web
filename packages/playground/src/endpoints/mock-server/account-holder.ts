import { rest } from 'msw';
import { ACCOUNT_HOLDERS } from '../../../../../mocks/src/accountHolders';
import { endpoints } from '../endpoints';

const PREFIX = endpoints.accountHolder;

export const accountHolderMocks = [
    rest.get(`${PREFIX}/:id`, (req, res, ctx) => {
        const matchingMock = ACCOUNT_HOLDERS.find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Account Holder mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];
