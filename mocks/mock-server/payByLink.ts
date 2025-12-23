import { http, HttpResponse, PathParams } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { IPayByLinkStatusGroup } from '../../src';
import {
    PAY_BY_LINK_FILTERS,
    STORES,
    PAY_BY_LINK_CONFIGURATION,
    CURRENCIES,
    COUNTRIES,
    INSTALLMENTS,
    PAY_BY_LINK_SETTINGS,
    STORE_THEME,
    getPaymentLinkDetails,
    getPaymentLinkItemsByStatusGroup,
    expirePaymentLink,
} from '../mock-data';

const mockEndpoints = endpoints('mock');
const mockEndpointsPBL = endpoints('mock').payByLink;
const networkError = false;
const defaultPaginationLimit = 10;

const getStoreForRequestPathParams = (params: PathParams) => {
    const store = STORES.find(store => store.storeId === params.id);
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
    http.get(mockEndpointsPBL.currencies, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: CURRENCIES,
        });
    }),

    // GET /countries
    http.get(mockEndpointsPBL.countries, async () => {
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

    // GET /paybylink/themes/{storeId}
    http.get(mockEndpointsPBL.themes, async ({ params }) => {
        const store = getStoreForRequestPathParams(params);
        console.log(store);
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(STORE_THEME[store.storeId as keyof typeof STORE_THEME]);
    }),

    // POST /paybylink/themes/{storeId}
    http.post(mockEndpointsPBL.themes, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(null, { status: 204 });
    }),

    // POST /paybylink/settings/{storeId}
    http.post(mockEndpointsPBL.settings, async () => {
        await delay();
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(null, { status: 204 });
    }),

    // GET /paybylink/paymentLinks/{paymentLinkId} - Single payment link details (returns full PaymentLinkDetails)
    http.get(mockEndpointsPBL.details, async ({ params }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);

        const paymentLinkDetails = getPaymentLinkDetails(params.id as string);

        if (!paymentLinkDetails) {
            return HttpResponse.json({ error: 'Payment link not found' }, { status: 404 });
        }

        return HttpResponse.json(paymentLinkDetails);
    }),

    // POST /paybylink/paymentLinks/{paymentLinkId}/expire - Expire a payment link
    http.post(mockEndpointsPBL.expire, async ({ params }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);

        try {
            expirePaymentLink(params.id as string);
        } catch (error) {
            return HttpResponse.json({ error: 'Payment link not found' }, { status: 404 });
        }

        // BE returns 200 instead of 204. Once this is fixed replace the following line with `return new HttpResponse(null, { status: 204 });`
        return HttpResponse.json(undefined, { status: 200 });
        // return new HttpResponse(null, { status: 204 });
    }),

    // GET /paybylink/paymentLinks - Payment links list
    http.get(mockEndpointsPBL.paymentLinks, async ({ request }) => {
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
        const filteredLinks = getPaymentLinkItemsByStatusGroup(statusGroup).filter(
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

        return HttpResponse.json({
            data: filteredLinks.slice(cursorValue, cursorValue + limitValue),
            _links: getPaginationLinks(cursorValue, limitValue, filteredLinks.length),
        });
    }),

    // GET /paybylink/paymentLinks - Payment links list
    http.get(mockEndpointsPBL.filters, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);

        return HttpResponse.json(PAY_BY_LINK_FILTERS);
    }),
];
