import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils/utils';

const path = endpoints('mock').sendUxdsEvent;
const networkError = false;

export const analyticsMock = [
    http.post(path, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json();
    }),
];
