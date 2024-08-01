import { rest, context } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { compareDates, delay, getPaginationLinks } from './utils';
import { getReports } from '../mock-data/reports';

const REPORTS = endpoints('mock').reports;
const DOWNLOAD = endpoints('mock').downloadReport;
const networkError = false;
const defaultPaginationLimit = 20;

export const reportsMock = [
    rest.get(`${REPORTS}`, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const balanceAccountId = req.url.searchParams.get('balanceAccountId');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');
        const limit = +(req.url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(req.url.searchParams.get('cursor') ?? 0);

        let reports = balanceAccountId ? getReports(balanceAccountId) : [];

        if (createdSince || createdUntil) {
            reports = reports.filter(
                report =>
                    (!createdSince || compareDates(report.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(report.createdAt, createdUntil, 'le'))
            );
        }

        const data = reports.slice(cursor, cursor + limit);

        return res(delay(400), ctx.json({ data, _links: getPaginationLinks(cursor, limit, reports.length) }));
    }),

    rest.get(`${DOWNLOAD}`, async (req, res, ctx) => {
        const balanceAccountId = req.url.searchParams.get('balanceAccountId');
        const createdAt = req.url.searchParams.get('createdAt');
        const reportDate = new Date(createdAt || Date.now()).toISOString().split('T', 1)[0]?.split('-');
        const filename = `${[balanceAccountId, 'payout', 'report'].concat(reportDate!).filter(Boolean).join('_')}.csv`;

        const buffer = await fetch(`/mockFiles/report.csv`).then(response => response.arrayBuffer());

        return res(
            context.set({
                'Content-Disposition': `attachment; filename=${filename}`,
                'Content-Type': 'text/csv',
            }),
            ctx.body(buffer)
        );
    }),
];
