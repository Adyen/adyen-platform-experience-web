import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { DISPUTES, getDisputeDetailByStatus, getDisputesByStatusGroup } from '../mock-data/disputes';

const mockEndpoints = endpoints('mock').disputes;
const networkError = false;
const downloadFileError = false;
const defaultPaginationLimit = 10;

export const disputesMocks = [
    http.get(mockEndpoints.list, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);
        const statusGroup = (url.searchParams.get('statusGroup') as 'open' | 'closed') ?? 'open';
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const limit = +(url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(url.searchParams.get('cursor') ?? 0);

        let disputes = getDisputesByStatusGroup(statusGroup);
        let responseDelay = 200;

        if (createdSince || createdUntil) {
            disputes = disputes.filter(
                dispute =>
                    (!createdSince || compareDates(dispute.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(dispute.createdAt, createdUntil, 'le'))
            );
            responseDelay = 400;
        }

        const data = disputes.slice(cursor, cursor + limit);

        await delay(responseDelay);
        return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, disputes.length) });
    }),

    http.get(mockEndpoints.details, async ({ params }) => {
        const matchingMock = DISPUTES.find(mock => mock.id === params.id);

        if (!matchingMock) return HttpResponse.text('Cannot find matching dispute mock', { status: 404 });

        await delay(1000);
        return HttpResponse.json({ ...matchingMock, ...getDisputeDetailByStatus(matchingMock.status) });
    }),
    http.post(mockEndpoints.accept, async () => {
        await delay(1000);
        return HttpResponse.json('ok');
    }),
    http.get(mockEndpoints.download, async ({ request }) => {
        await delay(1000);

        if (downloadFileError) {
            return HttpResponse.error();
        }

        const url = new URL(request.url);
        const filename = url.searchParams.get('documentType');

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
