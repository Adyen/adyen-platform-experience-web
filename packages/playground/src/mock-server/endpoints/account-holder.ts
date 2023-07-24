import { rest } from 'msw';
import { ACCOUNT_HOLDERS } from '../../../../../mocks/src/accountHolders';

const PREFIX = '/accountHolders';

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
