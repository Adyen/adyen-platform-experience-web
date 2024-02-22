import { rest } from 'msw';
import { mockEndpoints } from '../endpoints';

const PREFIX = mockEndpoints.sessions;

export const sessionsMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        return res(ctx.json({ id: 'test-id', token: 'test-token' }));
    }),
];
