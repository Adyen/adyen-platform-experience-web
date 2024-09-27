import {
    ACTIVE_GRANT,
    ACTIVE_UNREPAID_GRANT,
    DEFAULT_GRANT,
    DYNAMIC_CAPITAL_OFFER,
    FAILED_GRANT,
    PENDING_GRANT,
    REPAID_GRANT,
    REVOKED_GRANT,
    WRITTEN_OFF_GRANT,
} from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { http, HttpResponse } from 'msw';
import { delay } from './utils/utils';
import { getHandlerCallback, mocksFactory } from './utils/mocksHandlerFactory';
import { paths as CapitalPaths } from '../../src/types/api/resources/CapitalResource';

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

const capitalFactory = mocksFactory<CapitalPaths>();

export const CapitalMockedResponses = capitalFactory({
    unqualified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    prequalified: [
        { endpoint: mockEndpoints.dynamicOfferConfig, response: DYNAMIC_CAPITAL_OFFER },
        { endpoint: mockEndpoints.grants, handler: EMPTY_GRANTS_LIST },
    ],
    activeGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_GRANT] } },
    ],
    activeUnrepaidGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [ACTIVE_UNREPAID_GRANT] } },
    ],
    failedGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [FAILED_GRANT] } },
    ],
    pendingGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [PENDING_GRANT] } },
    ],
    repaidGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REPAID_GRANT] } },
    ],
    revokedGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [REVOKED_GRANT] } },
    ],
    writtenOffGrant: [
        { endpoint: mockEndpoints.dynamicOfferConfig, handler: EMPTY_OFFER },
        { endpoint: mockEndpoints.grants, response: { data: [WRITTEN_OFF_GRANT] } },
    ],
});
