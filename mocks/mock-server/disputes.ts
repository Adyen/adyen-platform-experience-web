import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { DISPUTE_DEFENSE_DOCUMENTS, DISPUTES, getDisputeDetailByStatus, getDisputesByStatusGroup } from '../mock-data/disputes';

const mockEndpoints = endpoints('mock').disputes;
const networkError = false;
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

    http.get(mockEndpoints.documents, async ({ params }) => {
        const matchingMock = DISPUTES.find(mock => mock.id === params.id);

        if (!matchingMock) return HttpResponse.json({ error: 'Cannot find matching dispute' }, { status: 404 });

        await delay(400);

        // Return the same list of applicable documents for all disputes
        return HttpResponse.json({ data: DISPUTE_DEFENSE_DOCUMENTS });
    }),

    http.post(mockEndpoints.accept, async () => {
        await delay(1000);
        return HttpResponse.json('ok');
    }),

    http.post(mockEndpoints.defend, async ({ params, request }) => {
        const matchingMock = DISPUTES.find(mock => mock.id === params.id);

        if (!matchingMock) return HttpResponse.json({ error: 'Cannot find matching dispute' }, { status: 404 });

        try {
            // Expects a multipart/form-data request
            const formData = await request.formData();

            // Expects a `defenseReason` to be provided
            const defenseReason = formData.get('defenseReason');

            if (typeof defenseReason !== 'string' || !defenseReason.trim()) {
                // Defense reason is missing (this is definitely a bad request)
                return HttpResponse.json({ error: 'Missing defense reason' }, { status: 400 });
            }

            // Check through the applicable defense documents for the specified defense reason
            for (const applicableDocument of DISPUTE_DEFENSE_DOCUMENTS) {
                const file = formData.get(applicableDocument.type);

                // A file was uploaded for the corresponding form data field (everything is good)
                if (file instanceof File) continue;

                if (applicableDocument.requirement === 'required') {
                    // No file was uploaded for the corresponding form data field
                    // Since this document is required (this is definitely a bad request)
                    return HttpResponse.json({ error: `Missing ${applicableDocument.type} document` }, { status: 400 });
                }
            }

            await delay(400);
            return new HttpResponse(null, { status: 204 });
        } catch {
            // This request is most likely not a multipart/form-data request (it is a bad request)
            return HttpResponse.json('', { status: 415 });
        }
    }),
];
