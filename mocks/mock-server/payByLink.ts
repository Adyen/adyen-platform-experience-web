import { http, HttpResponse } from 'msw';
import { delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS } from '../mock-data/payByLink';

const mockEndpoints = endpoints('mock').payByLink;
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
        const limit = parseInt(url.searchParams.get('limit') || String(defaultPaginationLimit), 10);

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
    http.get(mockEndpoints.configuration, async () => {
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
    http.get(mockEndpoints.installments, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: INSTALLMENTS,
        });
    }),
];
