import { rest } from 'msw';
import { endpoints } from '../endpoints/endpoints';

const PREFIX = endpoints('mock').sessions;

export const sessionsMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        return res(ctx.json({ id: 'test-id', token: 'test-token' }));
    }),
];
