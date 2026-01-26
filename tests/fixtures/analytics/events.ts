import { test as base, type Page } from '@playwright/test';
import type { EmbeddedEventItem, EventName } from '../../../src/core/Analytics/analytics/user-events';

export type PageAnalyticsEvent = Promise<{
    event: EventName;
    properties: EmbeddedEventItem['properties'];
}>;

const pageAnalyticsEventsMap = new WeakMap<Page, PageAnalyticsEvent[]>();

export const test = base.extend<{ analyticsEvents: PageAnalyticsEvent[] }>({
    analyticsEvents: async ({ page }, use) => {
        let analyticsEvents = pageAnalyticsEventsMap.get(page);

        if (analyticsEvents === undefined) {
            page.on('request', request => {
                if (request.url().includes('/uxdsclient/track')) {
                    analyticsEvents?.push(
                        (async () => {
                            const response = await request.response();
                            const data = await response?.json();
                            return data as PageAnalyticsEvent;
                        })()
                    );
                }
            });
            pageAnalyticsEventsMap.set(page, (analyticsEvents = []));
        }

        // use analytics events in the test
        await use(analyticsEvents);

        // cleanup after the test
        analyticsEvents.length = 0;
        pageAnalyticsEventsMap.delete(page);
    },
});

export { expect } from '@playwright/test';
