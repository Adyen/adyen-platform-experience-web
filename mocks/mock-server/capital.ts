import { DYNAMIC_CAPITAL_OFFER, SINGLE_GRANT } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { http, HttpResponse } from 'msw';
import { delay } from './utils/utils';
import { getHandlerCallback, mocksHandlerFactory } from './utils/mocksHandlerFactory';

const mockEndpoints = endpoints('mock').capital;
const networkError = false;

const EMPTY_GRANTS_LIST = getHandlerCallback({
    response: {
        data: [],
    },
});

const EMPTY_OFFER = getHandlerCallback({ response: {} });

export const capitalMock = [
    http.get(mockEndpoints.dynamicOfferConfig, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
    }),
    http.get(mockEndpoints.grants, EMPTY_GRANTS_LIST),
];

export const CapitalMockedResponses = mocksHandlerFactory('Capital', {
    unqualified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    prequalified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    grantList_singleGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: SINGLE_GRANT } },
    ],
});
