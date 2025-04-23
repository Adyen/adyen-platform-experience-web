import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { DISPUTES, getDisputeDetailByDefensibility, getDisputesByStatusGroup } from '../mock-data/disputes';
import { IDispute, IDisputeStatusGroup } from '../../src/types/api/models/disputes';

const mockEndpoints = endpoints('mock').disputes;
const networkError = false;
const defaultPaginationLimit = 10;

export const disputesMocks = [
    http.get(mockEndpoints.list, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);
        const statusGroup = ((url.searchParams.get('statusGroup') as IDisputeStatusGroup) ?? 'NEW_CHARGEBACKS') satisfies IDisputeStatusGroup;
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const limit = +(url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(url.searchParams.get('cursor') ?? 0);

        let disputes: IDispute[] = getDisputesByStatusGroup(statusGroup);
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
        const matchingMock = DISPUTES.find(mock => mock.pspReference === params.id);

        if (!matchingMock) return HttpResponse.text('Cannot find matching dispute mock', { status: 404 });

        await delay(1000);
        return HttpResponse.json({ ...matchingMock, ...getDisputeDetailByDefensibility(matchingMock) });
    }),
    http.post(mockEndpoints.accept, async () => {
        await delay(1000);
        return HttpResponse.json('ok');
    }),
];
