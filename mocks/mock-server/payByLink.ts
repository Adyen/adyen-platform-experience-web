import { http, HttpResponse, PathParams } from 'msw';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import { IPaymentLinkStatusGroup } from '../../src';
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
import AdyenPlatformExperienceError from '../../src/core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../src/core/Http/utils';
import {
    CapitalComponentManage,
    DisputesComponentManage,
    PayByLinkComponentManageLinks,
    PayByLinkComponentView,
    PayoutsOverviewComponentView,
    ReportsOverviewComponentView,
    TransactionsOverviewComponentManageRefunds,
    TransactionsOverviewComponentView,
} from './utils/rolesToEndpointsMapping';

const DELAY_TIME = 300;

export const PAY_BY_LINK_ERRORS = {
    // (Invalid ID)
    INVALID_ID: new AdyenPlatformExperienceError(
        ErrorTypes.ERROR,
        '769ac4ce59f0f159ad672d38d3291e91',
        undefined,
        '29_001',
        [{ name: 'paymentLinkId', value: 'PL...', message: 'Must be a valid payment link ID' }],
        '422'
    ),
    // (Too Many Stores)
    TOO_MANY_STORES: new AdyenPlatformExperienceError(
        ErrorTypes.ERROR,
        '769ac4ce59f0f159ad672d38d3291e91',
        undefined,
        '29_001',
        [{ name: 'storeIds', value: '', message: 'Number of stores must be less or equal than 20' }],
        '422'
    ),
    // (Invalid Terms URL)
    INVALID_TERMS_URL: new AdyenPlatformExperienceError(
        ErrorTypes.ERROR,
        '769ac4ce59f0f159ad672d38d3291e91',
        'Internal error',
        '00_500',
        undefined,
        '500'
    ),
    // (Amount Too High)
    INVALID_FIELDS: new AdyenPlatformExperienceError(
        ErrorTypes.ERROR,
        'c1687a5dab2d374ba9e1831aa88f3288',
        'he request is missing required fields or contains invalid data.',
        '29_001',
        [{ name: 'amount', value: '', message: 'invalid_amount' }],
        '422'
    ),
};

const mockEndpoints = endpoints();
const mockPayByLinkEndpoints = mockEndpoints.payByLink;
const networkError = false;
const defaultPaginationLimit = 10;

const getStoreForRequestPathParams = (params: PathParams) => {
    const store = STORES.find(store => store.storeId === params.id);
    if (!store) throw HttpResponse.json({ error: 'Cannot find store' }, { status: 404 });
    return store;
};

const getErrorHandler = (error: any, status = 500) => {
    return async () => {
        await delay(DELAY_TIME);
        return HttpResponse.json({ ...error, status, detail: 'detail' }, { status });
    };
};

export const PayByLinkOverviewMockedResponses = {
    tooManyStores: {
        handlers: [http.get(mockPayByLinkEndpoints.list, getErrorHandler(PAY_BY_LINK_ERRORS.TOO_MANY_STORES, 422))],
    },
    emptyList: {
        handlers: [
            http.get(mockPayByLinkEndpoints.list, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.json({ data: [], _links: {} }, { status: 200 });
            }),
        ],
    },
    storeNetworkError: {
        handlers: [http.get(endpoints().stores, async () => HttpResponse.error())],
    },
    filtersNetworkError: {
        handlers: [http.get(mockPayByLinkEndpoints.filters, async () => HttpResponse.error())],
    },
    storesMisconfiguration: {
        handlers: [
            http.get(mockEndpoints.stores, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.json({ data: [], _links: {} }, { status: 200 });
            }),
        ],
    },

    filterError: {
        handlers: [
            http.get(mockPayByLinkEndpoints.filters, async () => {
                await delay(300);
                return HttpResponse.error();
            }),
        ],
    },
};

export const PaymentLinkCreationMockedResponses = {
    submitNetworkError: {
        handlers: [
            http.post(mockPayByLinkEndpoints.list, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
    submitInvalidFields: {
        handlers: [
            http.post(mockPayByLinkEndpoints.list, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.json(PAY_BY_LINK_ERRORS.INVALID_FIELDS, { status: 422 });
            }),
        ],
    },
    configError: {
        handlers: [
            http.get(mockPayByLinkEndpoints.configuration, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
    countryDatasetError: {
        handlers: [
            http.get(mockEndpoints.datasets.countries, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
};

export const PaymentLinkDetailsMockedResponses = {
    redacted: {
        handlers: [
            http.get(mockPayByLinkEndpoints.details, async ({ params }) => {
                await delay(DELAY_TIME);
                const { id } = params;
                if (!id) {
                    return HttpResponse.json({ error: 'Payment link ID is required' }, { status: 400 });
                }
                const refinedId = Array.isArray(id) && id.length ? id[0] : id;
                return HttpResponse.json(getPaymentLinkDetails(refinedId, true), { status: 200 });
            }),
        ],
    },
    errorDetails: {
        handlers: [
            http.get(mockPayByLinkEndpoints.details, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
    errorExpiration: {
        handlers: [
            http.post(mockPayByLinkEndpoints.expire, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
};

export const PaymentLinkThemesMockedResponses = {
    themeError: {
        handlers: [
            http.get(mockEndpoints.payByLink.themes, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },

    saveThemesError: {
        handlers: [
            http.post(mockEndpoints.payByLink.themes, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },
};

export const PaymentLinkSettingsMockedResponses = {
    termsAndConditionsError: {
        handlers: [
            http.get(mockEndpoints.payByLink.settings, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },

    saveSettingsError: {
        handlers: [
            http.post(mockEndpoints.payByLink.settings, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.error();
            }),
        ],
    },

    permissionError: {
        handlers: [
            http.post(mockEndpoints.setup, async () => {
                await delay(DELAY_TIME);
                return HttpResponse.json({
                    endpoints: {
                        ...TransactionsOverviewComponentView,
                        ...TransactionsOverviewComponentManageRefunds,
                        ...ReportsOverviewComponentView,
                        ...PayoutsOverviewComponentView,
                        ...CapitalComponentManage,
                        ...DisputesComponentManage,
                        ...PayByLinkComponentView,
                        ...PayByLinkComponentManageLinks,
                    },
                });
            }),
        ],
    },
};

export const payByLinkMocks = [
    // GET /stores
    http.get(mockEndpoints.stores, async ({ request }) => {
        await delay(DELAY_TIME);
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
    http.get(mockPayByLinkEndpoints.configuration, async ({ params }) => {
        await delay(DELAY_TIME);
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
    http.post(mockPayByLinkEndpoints.list, async () => {
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        const now = new Date();
        const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const url = 'http://pay.adyen/links/12345';

        return HttpResponse.json({
            url,
            expireAt: expiration.toISOString(),
            paymentLinkId: 'PLTEST001',
        });
    }),

    // GET /currencies
    http.get(mockPayByLinkEndpoints.currencies, async () => {
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: CURRENCIES,
        });
    }),

    // GET /countries
    http.get(mockPayByLinkEndpoints.countries, async () => {
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: COUNTRIES,
        });
    }),

    // GET /paybylink/installments
    http.get(mockPayByLinkEndpoints.installments, async () => {
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({
            data: INSTALLMENTS,
        });
    }),

    // GET /paybylink/settings/{storeId}
    http.get(mockPayByLinkEndpoints.settings, async ({ params }) => {
        await delay(DELAY_TIME);
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
    http.get(mockPayByLinkEndpoints.themes, async ({ params }) => {
        const store = getStoreForRequestPathParams(params);
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json(STORE_THEME[store.storeId as keyof typeof STORE_THEME]);
    }),

    // POST /paybylink/themes/{storeId}
    http.post(mockPayByLinkEndpoints.themes, async () => {
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({}, { status: 200 });
    }),

    // POST /paybylink/settings/{storeId}
    http.post(mockPayByLinkEndpoints.settings, async ({ request }) => {
        const body = await request.clone().json();
        await delay(DELAY_TIME);
        if (networkError) {
            return HttpResponse.json({ error: 'Network error' }, { status: 500 });
        }

        return HttpResponse.json({ termsOfServiceUrl: body.termsOfServiceUrl }, { status: 200 });
    }),

    // GET /paybylink/paymentLinks/{paymentLinkId} - Single payment link details (returns full PaymentLinkDetails)
    http.get(mockPayByLinkEndpoints.details, async ({ params }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(DELAY_TIME);

        const paymentLinkDetails = getPaymentLinkDetails(params.id as string);

        if (!paymentLinkDetails) {
            return HttpResponse.json({ error: 'Payment link not found' }, { status: 404 });
        }

        return HttpResponse.json(paymentLinkDetails);
    }),

    // POST /paybylink/paymentLinks/{paymentLinkId}/expire - Expire a payment link
    http.post(mockPayByLinkEndpoints.expire, async ({ params }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(DELAY_TIME);

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
    http.get(mockPayByLinkEndpoints.list, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(DELAY_TIME);

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
        const statusGroup = url.searchParams.get('statusGroup')! as IPaymentLinkStatusGroup;

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

        if (paymentLinkId && /[^a-zA-Z0-9]/.test(paymentLinkId)) {
            return HttpResponse.json({ ...PAY_BY_LINK_ERRORS.INVALID_ID, status: 422, detail: 'detail' }, { status: 422 });
        }

        return HttpResponse.json({
            data: filteredLinks.slice(cursorValue, cursorValue + limitValue),
            _links: getPaginationLinks(cursorValue, limitValue, filteredLinks.length),
        });
    }),

    // GET /paybylink/paymentLinks - Payment links list
    http.get(mockPayByLinkEndpoints.filters, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(DELAY_TIME);

        return HttpResponse.json(PAY_BY_LINK_FILTERS);
    }),
];
