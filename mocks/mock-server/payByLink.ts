import { http, HttpResponse } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS } from '../mock-data/payByLink';
import { PAY_BY_LINK_FILTERS, PAYMENT_LINKS_LIST_RESPONSE } from '../mock-data';

const mockEndpoints = endpoints('mock');
const mockEndpointsPBL = endpoints('mock').payByLink;
const networkError = false;
const defaultPaginationLimit = 10;

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

    // GET /paybylink/paymentLinks/configuration
    http.get(mockEndpointsPBL.configuration, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(PAY_BY_LINK_CONFIGURATION);
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
        const currency = url.searchParams.get('currency');
        const status = url.searchParams.get('statuses');
        const creationSince = url.searchParams.get('creationSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const linkType = url.searchParams.get('linkType');
        const cursor = url.searchParams.get('cursor');
        const limit = url.searchParams.get('limit');

        // Filter payment links based on query parameters
        const filteredLinks = [...PAYMENT_LINKS_LIST_RESPONSE.data].filter(
            link =>
                (!paymentLinkId || link.id === paymentLinkId) &&
                (!merchantReference || link.merchantReference.toLowerCase().includes(merchantReference.toLowerCase())) &&
                (!status || link.status === status) &&
                (!currency || link.amount.currency === currency) &&
                (!linkType || link.reusable === (linkType === 'open')) &&
                (!amount || link.amount.value === Number(amount)) &&
                (!creationSince || compareDates(link.creationDate, creationSince, 'ge')) &&
                (!createdUntil || compareDates(link.creationDate, createdUntil, 'le'))
        );

        // Pagination logic
        const cursorValue = +(cursor ?? 0);
        const limitValue = +(limit ?? defaultPaginationLimit);

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
