import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from '@integration-components/testing/msw';
import { setupBasicResponse } from '@integration-components/testing/fixtures';

export { setupBasicResponse };

const networkError = false;
const path = endpoints().setup;

export const setupMock = [
    http.post(path, async () => {
        if (networkError) {
            return HttpResponse.error();
        }
        await delay(200);
        return HttpResponse.json({
            ...setupBasicResponse,
        });
    }),
];
