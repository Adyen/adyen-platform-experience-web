import { http, HttpResponse } from 'msw';
import { getPayouts, PAYOUTS_WITH_DETAILS } from '../mock-data';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';

const mockEndpoints = endpoints();
const networkError = false;
const defaultPaginationLimit = 20;

export const payoutsMocks = [
    http.get(mockEndpoints.payouts, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);

        const balanceAccountId = url.searchParams.get('balanceAccountId');
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const limit = +(url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(url.searchParams.get('cursor') ?? 0);

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

        await delay(responseDelay);
        return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, payouts.length) });
    }),

    http.get(mockEndpoints.payout, ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);
        const matchingMock = PAYOUTS_WITH_DETAILS.find(
            mock => mock.balanceAccountId === url.searchParams.get('balanceAccountId') && mock.payout?.createdAt === url.searchParams.get('createdAt')
        );

        if (!matchingMock) {
            HttpResponse.text('Cannot find matching Payout', { status: 404 });
            return;
        }

        return HttpResponse.json(matchingMock);
    }),
];
