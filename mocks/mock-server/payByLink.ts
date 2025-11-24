import { http, HttpResponse, PathParams } from 'msw';
import { delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS, STORE_THEME } from '../mock-data/payByLink';

const mockEndpoints = endpoints('mock');
const mockEndpointsPBL = endpoints('mock').payByLink;
const networkError = false;
const defaultPaginationLimit = 10;

const getStoreForRequestPathParams = (params: PathParams) => {
    const store = STORES.find(store => store.storeCode === params.id);
    if (!store) throw HttpResponse.json({ error: 'Cannot find store' }, { status: 404 });
    return store;
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
        const limit = parseInt(url.searchParams.get('limit'), 10) || defaultPaginationLimit;

        const startIndex = parseInt(cursor, 10) || 0;
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

    // GET /paybylink/themes/{storeId}
    http.get(mockEndpointsPBL.themes, async ({ params }) => {
        const store = getStoreForRequestPathParams(params);
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: STORE_THEME[store.storeCode as keyof typeof STORE_THEME],
        });
    }),

    // POST /paybylink/themes/{storeId}
    http.post(mockEndpointsPBL.themes, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({});
    }),
];
