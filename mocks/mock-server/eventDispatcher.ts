import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { withDelay } from '@integration-components/testing/msw';

const trackPath = endpoints().sendTrackEvent;
const engagePath = endpoints().sendEngageEvent;
const networkError = false;

export const analyticsMock = [
    http.post(
        trackPath,
        withDelay(async ({ request }) => {
            if (networkError) {
                return HttpResponse.error();
            }

            const formData = await request.formData();
            const data = formData.get('data');
            const buffer = Uint8Array.from(atob(data as string), m => m.codePointAt(0)!);

            return HttpResponse.json(JSON.parse(new TextDecoder().decode(buffer)));
        })
    ),

    http.post(
        engagePath,
        withDelay(() => {
            if (networkError) {
                return HttpResponse.error();
            }
            return HttpResponse.json({});
        })
    ),
];
