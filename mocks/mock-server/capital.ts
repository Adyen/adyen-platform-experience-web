import { DYNAMIC_CAPITAL_OFFER, SINGLE_GRANT } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';
import { http, HttpResponse } from 'msw';

const mockEndpoints = endpoints('mock').capital;
const networkError = false;

export const capitalMock = [
    http.get(mockEndpoints.dynamicOfferConfig, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
    }),

    http.get(mockEndpoints.grants, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
            data: [],
        });
    }),
];

export const CapitalMockedResponses = {
    prequalified: [
        http.get(mockEndpoints.dynamicOfferConfig, async () => {
            if (networkError) {
                return HttpResponse.error();
            }
            await delay(200);
            return HttpResponse.json(DYNAMIC_CAPITAL_OFFER);
        }),

        http.get(mockEndpoints.grants, async () => {
            if (networkError) {
                return HttpResponse.error();
            }
            await delay(200);
            return HttpResponse.json({
                data: [],
            });
        }),
    ],
    grantList: [
        http.get(mockEndpoints.grants, async () => {
            if (networkError) {
                return HttpResponse.error();
            }
            await delay(200);
            return HttpResponse.json({
                data: [SINGLE_GRANT],
            });
        }),
    ],
};
