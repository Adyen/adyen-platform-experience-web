import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { setupBasicResponse } from '@integration-components/testing/fixtures';
import { withDelay } from '@integration-components/testing/msw';

const networkError = false;
const path = endpoints().setup;

export const setupMock = [
    http.post(
        path,
        withDelay(() => {
            if (networkError) {
                return HttpResponse.error();
            }
            return HttpResponse.json({
                ...setupBasicResponse,
            });
        })
    ),
];
