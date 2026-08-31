import { delay as mswDelay, http, HttpResponse } from 'msw';
import { BALANCE_ACCOUNTS_SINGLE } from '@integration-components/testing/fixtures';
import { CapitalComponentManage, compareDates, CROSS_DOMAIN_ENDPOINTS, delay, getPaginationLinks } from '@integration-components/testing/msw';
import { REPORTS_ENDPOINTS as endpoints } from '../endpoints';
import { getReports } from '../mock-data/reports';

const networkError = false;
const serverError = false;

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';

export const createDownloadReportHandler = (options?: { downloadError?: boolean; enforceDownloadDelay?: boolean }) => {
    return http.get(endpoints.downloadReport, async ({ request }) => {
        const url = new URL(request.url);
        const createdAt = url.searchParams.get('createdAt');
        const reportDate = new Date(createdAt || Date.now()).toISOString().split('T', 1)[0]?.split('-');
        const filename = `${['balanceaccount', 'payout', 'report'].concat(reportDate!).filter(Boolean).join('_')}.csv`;

        const buffer = await fetch(`/mockFiles/report.csv`).then(response => response.arrayBuffer());
        const delayFn = options?.enforceDownloadDelay ? mswDelay : delay;
        await delayFn(2000);

        if (options?.downloadError) {
            return new HttpResponse(
                JSON.stringify({
                    type: 'https://docs.adyen.com/errors/forbidden',
                    errorCode: '999_429_001',
                    title: 'Forbidden',
                    detail: 'Too many download requests',
                    status: 429,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return new HttpResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename=${filename}`,
                'Content-Type': 'text/csv',
            },
            status: 200,
        });
    });
};

export const reportsMock = [
    http.get(endpoints.reports, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }

        if (serverError) {
            return new HttpResponse(
                JSON.stringify({
                    type: 'https://docs.adyen.com/errors/forbidden',
                    errorCode: '00_500',
                    title: 'Forbidden',
                    detail: 'Balance Account does not belong to Account Holder',
                    requestId: '769ac4ce59f0f159ad672d38d3291e91',
                    status: 500,
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
        const url = new URL(request.url);

        const balanceAccountId = url.searchParams.get('balanceAccountId');
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const cursor = +(url.searchParams.get('cursor') ?? 0);
        const limit = +(url.searchParams.get('limit') ?? DEFAULT_PAGE_LIMIT);
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

    createDownloadReportHandler({ enforceDownloadDelay: false }),
];

export const REPORTS_OVERVIEW_HANDLERS = {
    // Setup response without any reports or balanceAccounts endpoints (CapitalComponentManage
    // deliberately contains none), so the Reports Overview component reports `hasPermission === false`
    // (role not assigned) and no domain data requests fire.
    permissionError: {
        handlers: [
            http.post(CROSS_DOMAIN_ENDPOINTS.setup, async () => {
                await delay(400);
                return HttpResponse.json({
                    endpoints: {
                        ...CapitalComponentManage,
                    },
                });
            }),
        ],
    },
    singleBalanceAccount: {
        handlers: [
            http.get(endpoints.balanceAccounts, () => {
                return HttpResponse.json({ data: BALANCE_ACCOUNTS_SINGLE });
            }),
        ],
    },
    emptyList: {
        handlers: [
            http.get(endpoints.reports, () => {
                return HttpResponse.json({ data: [], _links: {} });
            }),
        ],
    },
    errorList: {
        handlers: [
            http.get(endpoints.reports, () => {
                return HttpResponse.error();
            }),
        ],
    },
    downloadError: {
        handlers: [createDownloadReportHandler({ downloadError: true })],
    },
};
