import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';

const trackPath = endpoints('mock').sendTrackEvent;
const engagePath = endpoints('mock').sendEngageEvent;
const networkError = false;

export const analyticsMock = [
    http.post(trackPath, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json();
    }),

    http.post(engagePath, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json();
    }),
];
