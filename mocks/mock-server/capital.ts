import { DYNAMIC_CAPITAL_OFFER, DEFAULT_GRANTS } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils';
import { http, HttpResponse } from 'msw';

const mockEndpoints = endpoints('mock').capital;
const networkError = false;

export const capitalMock = [
    http.get(mockEndpoints.dynamicOfferConfig, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(500);
        return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
    }),

    http.get(mockEndpoints.grants, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(500);
        return HttpResponse.json({
            data: DEFAULT_GRANTS,
        });
    }),
];
