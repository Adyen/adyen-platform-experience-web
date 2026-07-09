import { SIGNED_OFFER } from '../mock-data/capital';
import { http, HttpResponse } from 'msw';
import { delay } from '@integration-components/testing/msw';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { getCreateOfferResponse, getDynamicOfferResponse } from './utils';

export const capitalDefaultHandlers = [
    http.all('*', async () => {
        await delay();
    }),
    http.get(CAPITAL_ENDPOINTS.dynamicOffer, ({ request }) => {
        return getDynamicOfferResponse(request);
    }),
    http.post(CAPITAL_ENDPOINTS.createOffer, ({ request }) => {
        return getCreateOfferResponse(request);
    }),
    http.post(CAPITAL_ENDPOINTS.requestFunds, () => {
        return HttpResponse.json(SIGNED_OFFER);
    }),
];
