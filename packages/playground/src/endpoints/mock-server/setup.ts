import { rest } from 'msw';
import { endpoints } from '../endpoints';

const PREFIX = endpoints.setup;

export const setupMock = [
    rest.post(`${PREFIX}`, (req, res, ctx) => {
        return res(
            ctx.json({
                endpoints: {
                    ping: {
                        method: 'GET',
                        url: 'ping',
                    },
                },
            })
        );
    }),
];
