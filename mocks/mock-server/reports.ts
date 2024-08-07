import { endpoints } from '../../endpoints/endpoints';
import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils';
import { getReports } from '../mock-data/reports';

const DEFAULT_SORT_DIRECTION = 'desc';

const REPORTS = endpoints('mock').reports;
const DOWNLOAD = endpoints('mock').downloadReport;
const networkError = false;
const defaultPaginationLimit = 20;

export const reportsMock = [
    http.get(`${REPORTS}`, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);

        const balanceAccountId = url.searchParams.get('balanceAccountId');
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const limit = +(url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(url.searchParams.get('cursor') ?? 0);
        const sortDirection = url.searchParams.get('sortDirection') ?? DEFAULT_SORT_DIRECTION;

        let reports = balanceAccountId ? getReports(balanceAccountId) : [];

        const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

        if (createdSince || createdUntil) {
            reports = reports
                .filter(
                    report =>
                        (!createdSince || compareDates(report.createdAt, createdSince, 'ge')) &&
                        (!createdUntil || compareDates(report.createdAt, createdUntil, 'le'))
                )
                .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);
        }

        const data = reports.slice(cursor, cursor + limit);
        await delay(400);

        return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, reports.length) });
    }),

    http.get(`${DOWNLOAD}`, async ({ request }) => {
        const url = new URL(request.url);
        const balanceAccountId = url.searchParams.get('balanceAccountId');
        const createdAt = url.searchParams.get('createdAt');
        const reportDate = new Date(createdAt || Date.now()).toISOString().split('T', 1)[0]?.split('-');
        const filename = `${['balanceaccount', 'payout', 'report'].concat(reportDate!).filter(Boolean).join('_')}.csv`;

        const buffer = await fetch(`/mockFiles/report.csv`).then(response => response.arrayBuffer());

        return new HttpResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename=${filename}`,
                'Content-Type': 'text/csv',
            },
            status: 200,
        });
    }),
];
