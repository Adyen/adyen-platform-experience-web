import { http, HttpResponse } from 'msw';
import { delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { STORES, PAY_BY_LINK_CONFIGURATION, CURRENCIES, COUNTRIES, INSTALLMENTS } from '../mock-data/payByLink';

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

    // GET /paybylink/paymentLinks/configuration
    http.get(mockEndpointsPBL.configuration, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(PAY_BY_LINK_CONFIGURATION);
    }),

    // POST /paybylink/paymentLinks/configuration
    http.post(mockEndpointsPBL.configuration, async ({ request }) => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        const body: any = await request.json().catch(() => ({}) as any);
        const now = new Date();
        const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return HttpResponse.json({
            amount: { currency: body?.currency || 'USD', value: Number(body?.amountValue) || 0 },
            creationDate: now.toISOString(),
            expirationDate: expiration.toISOString(),
            linkType: body?.linkType === 'open' ? 'open' : 'singleUse',
            merchantReference: body?.merchantReference || 'MR-REF',
            paymentLinkId: `plink_${Math.random().toString(36).slice(2, 10)}`,
            shopperEmail: body?.emailAddress,
            status: 'active',
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
];
