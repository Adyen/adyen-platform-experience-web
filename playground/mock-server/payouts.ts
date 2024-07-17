import { rest } from 'msw';
import { getPayouts, PAYOUTS_WITH_DETAILS } from '../../mocks/mock-data';
import { compareDates, delay, getPaginationLinks } from './utils';
import { endpoints } from '../endpoints/endpoints';

const mockEndpoints = endpoints('mock');
const networkError = false;
const defaultPaginationLimit = 20;

export const payoutsMocks = [
    rest.get(mockEndpoints.payouts, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const balanceAccountId = req.url.searchParams.get('balanceAccountId');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        let payouts = balanceAccountId ? getPayouts(balanceAccountId) : [];
        let responseDelay = 200;

        if (balanceAccountId || createdSince || createdUntil) {
            payouts = payouts.filter(
                payout =>
                    (!createdSince || compareDates(payout.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(payout.createdAt, createdUntil, 'le'))
            );
            responseDelay = 400;
        }

        const data = payouts.slice(cursor, cursor + limit);

        return res(delay(responseDelay), ctx.json({ data, _links: getPaginationLinks(cursor, limit, payouts.length) }));
    }),

    rest.get(mockEndpoints.payout, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const matchingMock = PAYOUTS_WITH_DETAILS.find(
            mock =>
                mock.balanceAccountId === req.url.searchParams.get('balanceAccountId') &&
                mock.payout?.createdAt === req.url.searchParams.get('createdAt')
        );

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Payout'));
            return;
        }

        return res(ctx.json(matchingMock));
    }),
];
