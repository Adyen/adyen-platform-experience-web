import { rest } from 'msw';
import { endpoints } from '../endpoints';

const PREFIX = endpoints('mock').sessions;

console.log('PREFIX', PREFIX);

export const sessionsMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        return res(ctx.json({ id: 'test-id', token: 'test-token' }));
    }),
];
