import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS, PAY_BY_LINK_SETTINGS } from '../mock-data/payByLink';
import { getPaymentLinksByStatusGroup, PAY_BY_LINK_FILTERS } from '../mock-data';
import { IPayByLinkStatusGroup } from '../../src';
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';

export const PAY_BY_LINK_ERRORS = {
    // (Invalid ID)
    INVALID_ID: new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e91', undefined, '29_001', [
        { name: 'paymentLinkId', value: 'PL...', message: 'Must be a valid payment link ID' },
    ]),
    // (Too Many Stores)
    TOO_MANY_STORES: new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e91', undefined, '29_001', [
        { name: 'storeIds', value: '', message: 'Number of stores must be less or equal than 20' },
    ]),
    // (Invalid Terms URL)
    INVALID_TERMS_URL: new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e91', 'Internal error', '00_500'),
};

const mockEndpoints = endpoints('mock');
const mockEndpointsPBL = endpoints('mock').payByLink;
const networkError = false;
const defaultPaginationLimit = 10;

const getErrorHandler = (error: any, status = 500) => {
    return async () => {
        await delay(300);
        return HttpResponse.json({ ...error, status, detail: 'detail' }, { status });
    };
};

export const PayByLinkOverviewMockedResponses = {
    tooManyStores: {
        handlers: [http.get(mockEndpointsPBL.paymentLinks, getErrorHandler(PAY_BY_LINK_ERRORS.TOO_MANY_STORES, 422))],
    },
    emptyList: {
        handlers: [
            http.get(mockEndpointsPBL.paymentLinks, async () => {
                await delay(300);
                return HttpResponse.json({ data: [], _links: {} }, { status: 200 });
            }),
        ],
    },
    storesMisconfiguration: {
        handlers: [
            http.get(mockEndpoints.stores, async () => {
                await delay(300);
                return HttpResponse.json({ data: [], _links: {} }, { status: 200 });
            }),
        ],
    },
};

export const payByLinkMocks = [
    // GET /stores
    http.get(mockEndpoints.stores, async ({ request }) => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        const url = new URL(request.url);
        const cursor = url.searchParams.get('cursor');
        const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : defaultPaginationLimit;

        const startIndex = cursor ? parseInt(cursor, 10) : 0;
        const endIndex = Math.min(startIndex + limit, STORES.length);
        const data = STORES.slice(startIndex, endIndex);

        const links = getPaginationLinks(startIndex, limit, STORES.length);

        return HttpResponse.json({
            _links: links,
            data,
        });
    }),

    // GET /paybylink/paymentLinks/{storeId}/configuration
    http.get(mockEndpointsPBL.configuration, async ({ params }) => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }
        const { storeId } = params;
        if (!storeId) {
            return HttpResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }
        const config = PAY_BY_LINK_CONFIGURATION[storeId as keyof typeof PAY_BY_LINK_CONFIGURATION];
        if (!config) {
            return HttpResponse.json({ error: 'Store not found' }, { status: 404 });
        }
        return HttpResponse.json(config);
    }),

    // POST /paybylink/paymentLinks
    http.post(mockEndpointsPBL.paymentLinks, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        const now = new Date();
        const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const url = 'http://pay.adyen/links/12345';

        return HttpResponse.json({
            url,
            expireAt: expiration.toISOString(),
        });
    }),

    // GET /currencies
    http.get(mockEndpoints.currencies, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: CURRENCIES,
        });
    }),

    // GET /countries
    http.get(mockEndpoints.countries, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: COUNTRIES,
        });
    }),

    // GET /paybylink/installments
    http.get(mockEndpointsPBL.installments, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: INSTALLMENTS,
        });
    }),

    // GET /paybylink/settings/{storeId}
    http.get(mockEndpointsPBL.getPayByLinkSettings, async ({ params }) => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        const { storeId } = params;

        if (!storeId) {
            return HttpResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }
        const settings = PAY_BY_LINK_SETTINGS[storeId as keyof typeof PAY_BY_LINK_SETTINGS];

        if (!settings) {
            return HttpResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        return HttpResponse.json(settings);
    }),

    // GET /paybylink/paymentLinks - Payment links list
    http.get(mockEndpoints.payByLink.paymentLinks, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);

        const url = new URL(request.url);
        const paymentLinkId = url.searchParams.get('paymentLinkId');
        const merchantReference = url.searchParams.get('merchantReference');
        const amount = url.searchParams.get('amount');
        const statuses = url.searchParams.getAll('statuses');
        const storeIds = url.searchParams.getAll('storeIds');
        const creationSince = url.searchParams.get('creationSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const linkTypes = url.searchParams.getAll('linkTypes');
        const cursor = url.searchParams.get('cursor');
        const limit = url.searchParams.get('limit');
        const statusGroup = url.searchParams.get('statusGroup')! as IPayByLinkStatusGroup;

        // Filter payment links based on query parameters
        const filteredLinks = getPaymentLinksByStatusGroup(statusGroup).filter(
            link =>
                (!paymentLinkId || link.paymentLinkId === paymentLinkId) &&
                (!merchantReference || link.merchantReference.toLowerCase().includes(merchantReference.toLowerCase())) &&
                (!statuses.length || statuses.includes(link.status)) &&
                (!linkTypes.length || linkTypes.includes(link.linkType)) &&
                (!storeIds.length || !link.storeCode || storeIds.includes(link.storeCode)) &&
                (!amount || link.amount.value === Number(amount)) &&
                (!creationSince || compareDates(link.creationDate, creationSince, 'ge')) &&
                (!createdUntil || compareDates(link.creationDate, createdUntil, 'le'))
        );

        // Pagination logic
        const cursorValue = +(cursor ?? 0);
        const limitValue = +(limit ?? defaultPaginationLimit);

        if (paymentLinkId && /[^a-zA-Z0-9]/.test(paymentLinkId)) {
            return HttpResponse.json({ ...PAY_BY_LINK_ERRORS.INVALID_ID, status: 422, detail: 'detail' }, { status: 422 });
        }

        return HttpResponse.json({
            data: filteredLinks.slice(cursorValue, cursorValue + limitValue),
            _links: getPaginationLinks(cursorValue, limitValue, filteredLinks.length),
        });
    }),

    // GET /paybylink/paymentLinks - Payment links list
    http.get(mockEndpoints.payByLink.filters, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);

        return HttpResponse.json(PAY_BY_LINK_FILTERS);
    }),
];
