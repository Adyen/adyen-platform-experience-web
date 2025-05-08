import { http, HttpResponse, PathParams } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { IDisputeDetail, IDisputeListItem, IDisputeStatusGroup } from '../../src/types/api/models/disputes';
import {
    CHARGEBACK_PENDING_DEFENDABLE_EXTERNALLY,
    DISPUTES,
    getAdditionalDisputeDetails,
    getApplicableDisputeDefenseDocuments,
    getDisputesByStatusGroup,
    MAIN_BALANCE_ACCOUNT,
    NOTIFICATION_OF_FRAUD,
    RFI_UNRESPONDED_DEFENDABLE_EXTERNALLY,
} from '../mock-data/disputes';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';

const mockEndpoints = endpoints('mock').disputes;
const networkError = false;
const downloadFileError = false;
const defaultPaginationLimit = 10;

const getDisputeForRequestPathParams = (params: PathParams) => {
    const dispute = DISPUTES.find(dispute => dispute.disputePspReference === params.id);
    if (!dispute) throw HttpResponse.json({ error: 'Cannot find dispute' }, { status: 404 });
    return dispute;
};

export const disputesMocks = [
    http.get(mockEndpoints.list, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const balanceAccount = searchParams.get('balanceAccountId');
        const statusGroup = searchParams.get('statusGroup')! as IDisputeStatusGroup;
        const reasonCategories = searchParams.getAll('reasonCategories');
        const schemeCodes = searchParams.getAll('schemeCodes');
        const createdSince = searchParams.get('createdSince');
        const createdUntil = searchParams.get('createdUntil');
        const limit = +(searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(searchParams.get('cursor') ?? 0);

        let disputes: IDisputeListItem[] = balanceAccount === MAIN_BALANCE_ACCOUNT.id ? getDisputesByStatusGroup(statusGroup) : [];
        let responseDelay = 200;

        if (createdSince || createdUntil) {
            disputes = disputes.filter(
                ({ createdAt, paymentMethod, reason }) =>
                    (!reasonCategories.length || reasonCategories.includes(reason.category)) &&
                    (!schemeCodes.length || schemeCodes.includes(paymentMethod.type)) &&
                    (!createdSince || compareDates(createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(createdAt, createdUntil, 'le'))
            );
            responseDelay = 400;
        }

        const data = disputes.slice(cursor, cursor + limit);

        await delay(responseDelay);
        return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, disputes.length) });
    }),

    http.get(mockEndpoints.details, async ({ params }) => {
        if (networkError) return HttpResponse.error();

        const dispute = getDisputeForRequestPathParams(params);
        await delay(1000);
        return HttpResponse.json({ ...getAdditionalDisputeDetails(dispute) });
    }),

    http.get(mockEndpoints.documents, async ({ params, request }) => {
        if (networkError) return HttpResponse.error();

        const dispute = getDisputeForRequestPathParams(params);
        const defenseReason = new URL(request.url).searchParams.get('defenseReason')?.trim();
        const defenseDocuments = getApplicableDisputeDefenseDocuments(dispute, defenseReason!) ?? [];

        await delay(400);
        return HttpResponse.json({ data: defenseDocuments });
    }),

    http.post(mockEndpoints.accept, async ({ params }) => {
        if (networkError) return HttpResponse.error();

        getDisputeForRequestPathParams(params);
        await delay(1000);
        return new HttpResponse(null, { status: 204 });
    }),

    http.post(mockEndpoints.defend, async ({ params, request }) => {
        if (networkError) return HttpResponse.error();

        const dispute = getDisputeForRequestPathParams(params);

        try {
            // Expects a multipart/form-data request
            const formData = await request.formData();

            // Expects a `defenseReason` to be provided
            const defenseReason = formData.get('defenseReason');

            if (typeof defenseReason !== 'string' || !defenseReason.trim()) {
                // Defense reason is missing (this is definitely a bad request)
                return HttpResponse.json({ error: 'Missing defense reason' }, { status: 400 });
            }

            const defenseDocuments = getApplicableDisputeDefenseDocuments(dispute, defenseReason.trim()) ?? [];

            // Some defense reasons require that at least one of certain types of documents be provided
            // Initially check to see if the current defense reason is one of such
            let missingOneOrMoreDocuments = defenseDocuments.some(({ requirementLevel }) => requirementLevel === 'ONE_OR_MORE');

            for (const applicableDocument of defenseDocuments) {
                // Check through the applicable defense documents
                const file = formData.get(applicableDocument.documentTypeCode);

                if (file instanceof File) {
                    // A file was uploaded for the corresponding form data field

                    if (applicableDocument.requirementLevel === 'ONE_OR_MORE') {
                        // Since a file has been uploaded for at least one of some expected types of documents,
                        // mark as no longer missing the expected documents
                        missingOneOrMoreDocuments = false;
                    }

                    // everything is good (continue to next applicable document)
                    continue;
                }

                if (applicableDocument.requirementLevel === 'REQUIRED') {
                    // No file was uploaded for the corresponding form data field
                    // Since this document is required (this is definitely a bad request)
                    return HttpResponse.json({ error: `Missing ${applicableDocument.documentTypeCode} document` }, { status: 400 });
                }
            }

            if (missingOneOrMoreDocuments) {
                return HttpResponse.json({ error: 'Missing one or more expected documents' }, { status: 400 });
            }

            await delay(1000);
            return new HttpResponse(null, { status: 204 });
        } catch {
            // This request is most likely not a multipart/form-data request (it is a bad request)
            return HttpResponse.json('', { status: 415 });
        }
    }),

    http.get(mockEndpoints.download, async ({ params, request }) => {
        if (networkError) return HttpResponse.error();

        getDisputeForRequestPathParams(params);
        await delay(1000);

        if (downloadFileError) return HttpResponse.error();

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

const httpGetDetails = http.get<any, any, IDisputeDetail>;

export const DISPUTES_HANDLERS = {
    undefendable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_PENDING_DEFENDABLE_EXTERNALLY);
            }),
        ],
    },
    rfi_acceptable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_UNRESPONDED_DEFENDABLE_EXTERNALLY);
            }),
        ],
    },
    notification_of_fraud: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(NOTIFICATION_OF_FRAUD);
            }),
        ],
    },
};
