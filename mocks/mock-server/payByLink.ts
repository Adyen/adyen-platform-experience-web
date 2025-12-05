import { http, HttpResponse } from 'msw';
import { delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS, PAY_BY_LINK_SETTINGS } from '../mock-data/payByLink';

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
        const cursorParam = url.searchParams.get('cursor');
        const limitParam = url.searchParams.get('limit');
        const cursor = cursorParam ? parseInt(cursorParam, 10) : 0;
        const limit = limitParam ? parseInt(limitParam, 10) : defaultPaginationLimit;

        const startIndex = cursor || 0;
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

        return HttpResponse.json({
            data: settings,
        });
    }),
];
