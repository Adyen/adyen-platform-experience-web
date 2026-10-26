import { CAPITAL_STATE_FIRST_OFFER, SIGNED_OFFER } from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { getCreateOfferResponse, getDynamicOfferResponse } from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalDefaultHandlers = [
    http.get(
        CAPITAL_ENDPOINTS.capitalState,
        withDelay(() => {
            return HttpResponse.json(CAPITAL_STATE_FIRST_OFFER);
        })
    ),
    http.get(
        CAPITAL_ENDPOINTS.dynamicOffer,
        withDelay(({ request }) => {
            return getDynamicOfferResponse(request);
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.createOffer,
        withDelay(({ request }) => {
            return getCreateOfferResponse(request);
        })
    ),
    http.post(
        CAPITAL_ENDPOINTS.requestFunds,
        withDelay(() => {
            return HttpResponse.json(SIGNED_OFFER);
        })
    ),
];
