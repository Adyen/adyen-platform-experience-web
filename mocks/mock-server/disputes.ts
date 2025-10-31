import { http, HttpResponse, PathParams, StrictResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { DISPUTE_PAYMENT_SCHEMES } from '../../src/components/utils/disputes/constants';
import { IDisputeDetail, IDisputeListItem, IDisputeStatusGroup, IDisputeListResponse } from '../../src/types/api/models/disputes';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';
import {
    ACCEPTED_DISPUTES,
    ALL_DISPUTES,
    CHARGEBACK_ACCEPTABLE,
    CHARGEBACK_AUTO_DEFENDED,
    CHARGEBACK_DEFENDABLE,
    CHARGEBACK_DEFENDABLE_EXTERNALLY,
    CHARGEBACK_DEFENDED,
    CHARGEBACK_LOST,
    CHARGEBACK_LOST_NO_ACTION,
    CHARGEBACK_LOST_WITH_ISSUER_FEEDBACK,
    CHARGEBACK_NOT_DEFENDABLE,
    CHARGEBACKS,
    DEFENDED_DISPUTES,
    DISPUTES,
    getAdditionalDisputeDetails,
    getApplicableDisputeDefenseDocuments,
    getDate,
    getDisputesByStatusGroup,
    MAIN_BALANCE_ACCOUNT,
    NOTIFICATION_OF_FRAUD,
    RFI_ACCEPTABLE,
    RFI_ACCEPTED,
    RFI_DEFENDABLE,
    RFI_EXPIRED,
    RFI_UNRESPONDED,
} from '../mock-data/disputes';

const mockEndpoints = endpoints('mock').disputes;
const networkError = false;
const downloadFileError = false;
const defaultPaginationLimit = 10;

const getRegexForPaymentSchemeCodesExcludingOthers = (schemeCodes: string[]) => {
    const schemes = schemeCodes.filter(scheme => DISPUTE_PAYMENT_SCHEMES[scheme as keyof typeof DISPUTE_PAYMENT_SCHEMES] && scheme !== 'others');
    return schemes.length ? new RegExp(schemes.join('|'), 'gi') : /^$/;
};

const getDisputeForRequestPathParams = (params: PathParams) => {
    const dispute = DISPUTES.find(dispute => dispute.disputePspReference === params.id);
    if (!dispute) throw HttpResponse.json({ error: 'Cannot find dispute' }, { status: 404 });
    return dispute;
};

const manageChargebackListItem = (dispute: IDisputeListItem, callback: (dispute: IDisputeListItem) => void) => {
    const chargebackIndex = CHARGEBACKS.findIndex(d => d === dispute);

    if (chargebackIndex >= 0) {
        const disputes = DISPUTES as any[];
        const allDisputes = ALL_DISPUTES as any[];
        const firstAllDispute = ALL_DISPUTES[0];

        CHARGEBACKS.splice(chargebackIndex, 1);
        allDisputes.unshift(dispute);

        disputes.splice(
            disputes.findIndex(d => d === dispute),
            1
        );
        disputes.splice(
            disputes.findIndex(d => d === firstAllDispute),
            0,
            dispute
        );

        callback(dispute);
    }
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

        let disputes: IDisputeListItem[] = [MAIN_BALANCE_ACCOUNT.id, null].includes(balanceAccount) ? getDisputesByStatusGroup(statusGroup) : [];
        let responseDelay = 200;

        if (createdSince || createdUntil) {
            let paymentSchemesFilter: (paymentMethod: string) => boolean = () => true;

            if (schemeCodes.length) {
                const checkOtherSchemeCodes = schemeCodes.includes('others');

                paymentSchemesFilter = paymentMethod => {
                    const schemeCodesRegex = getRegexForPaymentSchemeCodesExcludingOthers(schemeCodes);
                    let schemeCodeMatchFound = schemeCodesRegex.test(paymentMethod);

                    if (!schemeCodeMatchFound && checkOtherSchemeCodes) {
                        const allSchemeCodesRegex = getRegexForPaymentSchemeCodesExcludingOthers(Object.keys(DISPUTE_PAYMENT_SCHEMES));
                        schemeCodeMatchFound ||= !allSchemeCodesRegex.test(paymentMethod);
                    }

                    return schemeCodeMatchFound;
                };
            }

            disputes = disputes.filter(
                ({ createdAt, paymentMethod, reason }) =>
                    (!reasonCategories.length || reasonCategories.includes(reason.category)) &&
                    (!createdSince || compareDates(createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(createdAt, createdUntil, 'le')) &&
                    paymentSchemesFilter(paymentMethod.type)
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
        const defenseDocuments = getApplicableDisputeDefenseDocuments(dispute, defenseReason!);

        await delay(400);
        return HttpResponse.json({ data: defenseDocuments });
    }),

    http.post(mockEndpoints.accept, async ({ params }) => {
        if (networkError) return HttpResponse.error();

        manageChargebackListItem(getDisputeForRequestPathParams(params), dispute => {
            dispute.status = dispute.status === 'UNRESPONDED' ? 'EXPIRED' : 'ACCEPTED';
            ACCEPTED_DISPUTES.set(dispute, { acceptedOn: getDate(0) });
            delete dispute.dueDate;
        });

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

            const defenseDocuments = getApplicableDisputeDefenseDocuments(dispute, defenseReason.trim());
            const suppliedDocuments: string[] = [];

            // Some defense reasons require that at least one of certain types of documents be provided
            // Initially check to see if the current defense reason is one of such
            let missingOneOrMoreDocuments = defenseDocuments.some(({ requirementLevel }) => requirementLevel === 'ONE_OR_MORE');

            for (const applicableDocument of defenseDocuments) {
                // Check through the applicable defense documents
                const file = formData.get(applicableDocument.documentTypeCode);

                if (file instanceof File) {
                    // A file was uploaded for the corresponding form data field
                    suppliedDocuments.push(applicableDocument.documentTypeCode);

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

            manageChargebackListItem(dispute, dispute => {
                dispute.status = dispute.status === 'UNRESPONDED' ? 'RESPONDED' : 'PENDING';
                DEFENDED_DISPUTES.set(dispute, {
                    suppliedDocuments,
                    defendedOn: getDate(0),
                    reason: defenseReason.trim(),
                });
            });

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

type GetHttpError = AdyenPlatformExperienceError & { status: number; detail: string };

const httpGetList = http.get<any, any, IDisputeListResponse>;
const httpGetDetails = http.get<any, any, IDisputeDetail>;
const httpGetInternalError = http.get<any, any, GetHttpError>;
const httpPostInternalError = http.post<any, any, GetHttpError>;

const getErrorHandler = (error: AdyenPlatformExperienceError, status = 500): StrictResponse<GetHttpError> => {
    return HttpResponse.json({ ...error, status, detail: 'detail' }, { status });
};

const genericError500 = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '7ac77fd1d7ac77fd1d', 'Message', '00_500');

const DISPUTES_LIST_ERRORS = {
    internalServerError: {
        handlers: [
            httpGetInternalError(endpoints('mock').disputes.list, () => {
                return getErrorHandler({ ...genericError500 }, 500);
            }),
        ],
    },
    networkError: {
        handlers: [
            http.get(endpoints('mock').disputes.list, () => {
                return HttpResponse.error();
            }),
        ],
    },
};

export const DISPUTES_LIST_HANDLERS = {
    emptyList: {
        handlers: [
            httpGetList(endpoints('mock').disputes.list, () => {
                return HttpResponse.json({ data: [], _links: { next: { cursor: '' }, prev: { cursor: '' } } });
            }),
        ],
    },
    ...DISPUTES_LIST_ERRORS,
};

const DISPUTE_DETAILS_ERRORS = {
    internalServerError: {
        handlers: [
            httpGetInternalError(endpoints('mock').disputes.details, () => {
                return getErrorHandler({ ...genericError500 }, 500);
            }),
        ],
    },
    networkError: {
        handlers: [
            http.get(endpoints('mock').disputes.details, () => {
                return HttpResponse.error();
            }),
        ],
    },
    unprocessableEntityError: {
        handlers: [
            httpGetInternalError(endpoints('mock').disputes.details, () => {
                const adyenError = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '7ac77fd1d7ac77fd1d', 'Message', '30_112');

                return getErrorHandler({ ...adyenError }, 422);
            }),
        ],
    },
    downloadServerError: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_LOST);
            }),
            httpGetInternalError(endpoints('mock').disputes.download, async () => {
                await delay(400);
                return getErrorHandler({ ...genericError500 }, 500);
            }),
        ],
    },
    acceptServerError: {
        handlers: [
            httpGetInternalError(endpoints('mock').disputes.accept, () => {
                return getErrorHandler({ ...genericError500 }, 500);
            }),
        ],
    },
    defendServerError: {
        handlers: [
            httpPostInternalError(endpoints('mock').disputes.defend, () => {
                return getErrorHandler({ ...genericError500 }, 500);
            }),
        ],
    },
};

export const DISPUTE_DETAILS_HANDLERS = {
    chargebackAutoDefended: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_AUTO_DEFENDED);
            }),
        ],
    },
    chargebackDefendableExternally: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_DEFENDABLE_EXTERNALLY);
            }),
        ],
    },
    chargebackDefended: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_DEFENDED);
            }),
        ],
    },
    chargebackLostNotDefended: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_LOST_NO_ACTION);
            }),
        ],
    },
    chargebackNotDefendable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_NOT_DEFENDABLE);
            }),
        ],
    },
    notificationOfFraud: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(NOTIFICATION_OF_FRAUD);
            }),
        ],
    },
    rfiExpired: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_EXPIRED);
            }),
        ],
    },
    rfiAcceptable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_ACCEPTABLE);
            }),
        ],
    },
    rfiAccepted: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_ACCEPTED);
            }),
        ],
    },
    rfiDefendable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_DEFENDABLE);
            }),
        ],
    },
    rfiUnresponded: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(RFI_UNRESPONDED);
            }),
        ],
    },
    chargebackAcceptable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_ACCEPTABLE);
            }),
        ],
    },
    chargebackDefendable: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_DEFENDABLE);
            }),
        ],
    },
    chargebackLost: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_LOST);
            }),
        ],
    },
    chargebackLostWithFeedback: {
        handlers: [
            httpGetDetails(endpoints('mock').disputes.details, () => {
                return HttpResponse.json(CHARGEBACK_LOST_WITH_ISSUER_FEEDBACK);
            }),
        ],
    },
    ...DISPUTE_DETAILS_ERRORS,
};
