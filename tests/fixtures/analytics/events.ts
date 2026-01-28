import { test as base, type Page } from '@playwright/test';
import type { EmbeddedEventItem, EventName } from '../../../src/core/Analytics/analytics/user-events';

export type PageAnalyticsEvent = {
    event: EventName;
    properties: EmbeddedEventItem['properties'];
};

const pageAnalyticsEventsMap = new WeakMap<Page, PageAnalyticsEvent[]>();

export const test = base.extend<{ analyticsEvents: PageAnalyticsEvent[] }>({
    analyticsEvents: async ({ page }, use) => {
        let analyticsEvents = pageAnalyticsEventsMap.get(page);

        if (analyticsEvents === undefined) {
            pageAnalyticsEventsMap.set(page, (analyticsEvents = []));

            page.on('request', async request => {
                if (/uxdsclient\/track/.test(request.url())) {
                    const params = new URLSearchParams(request.postData() || '');
                    const data = params.get('data');

                    const eventPayloadBuffer = Uint8Array.from(atob(data as string), m => m.codePointAt(0)!);
                    const eventPayload: PageAnalyticsEvent = JSON.parse(new TextDecoder().decode(eventPayloadBuffer));

                    analyticsEvents?.push(eventPayload);
                }
            });
        }

        // use analytics events in the test
        await use(analyticsEvents);

        // cleanup after the test
        analyticsEvents.length = 0;
        pageAnalyticsEventsMap.delete(page);
    },
});

export { expect } from '@playwright/test';
