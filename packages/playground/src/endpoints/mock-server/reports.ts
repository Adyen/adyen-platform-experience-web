import { rest } from 'msw';
import { endpoints } from '../endpoints';
import { compareDates, delay, getPaginationLinks } from './utils';
import { getReports } from '@adyen/adyen-platform-experience-web-mocks';

const PREFIX = endpoints('mock').reports;
const networkError = false;
const defaultPaginationLimit = 20;

export const reportsMock = [
    rest.get(`${PREFIX}`, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const balanceAccountId = req.url.searchParams.get('balanceAccountId');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        let reports = balanceAccountId ? getReports(balanceAccountId) : [];
        console.log('balanceAccountId ', balanceAccountId);
        console.log('reports ', reports);
        if (balanceAccountId || createdSince || createdUntil) {
            reports = reports.filter(
                report =>
                    (!createdSince || compareDates(report.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(report.createdAt, createdUntil, 'le'))
            );
        }

        if (createdSince || createdUntil) {
            reports = reports.filter(
                payout =>
                    (!createdSince || compareDates(payout.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(payout.createdAt, createdUntil, 'le'))
            );
        }

        const data = reports.slice(cursor, cursor + limit);

        return res(delay(400), ctx.json({ data, _links: getPaginationLinks(cursor, limit, reports.length) }));
    }),
];
