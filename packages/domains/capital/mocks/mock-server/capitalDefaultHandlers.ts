import { CAPITAL_STATE_ELIGIBLE_LOAN } from '../mock-data';
import { http, HttpResponse } from 'msw';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { getCreateOfferResponse, getDynamicOfferResponse } from './utils';
import { withDelay } from '@integration-components/testing/msw';

export const capitalDefaultHandlers = [
    http.get(
        CAPITAL_ENDPOINTS.capitalState,
        withDelay(() => {
            return HttpResponse.json(CAPITAL_STATE_ELIGIBLE_LOAN);
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
];
