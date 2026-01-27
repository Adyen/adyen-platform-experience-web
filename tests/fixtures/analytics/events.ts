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
        let abort: (() => void) | undefined = undefined;

        if (analyticsEvents === undefined) {
            const abortController = new AbortController();
            const { signal } = abortController;

            const abortPromise = new Promise<void>(resolve => {
                signal.addEventListener('abort', () => resolve(), { once: true });
            });

            abort = abortController.abort.bind(abortController);

            (function captureNextAnalyticsRequest() {
                if (signal.aborted) {
                    abort = undefined;
                } else {
                    const nextRequestPromise = page.waitForRequest(/uxdsclient\/track/);

                    Promise.race([nextRequestPromise, abortPromise]).then(request => {
                        if (!request) return;
                        captureNextAnalyticsRequest();
                        analyticsEvents?.push(
                            (async () => {
                                const response = await request.response();
                                const data = await response?.json();
                                return data as PageAnalyticsEvent;
                            })()
                        );
                    });
                }
            })();

            pageAnalyticsEventsMap.set(page, (analyticsEvents = []));
        }

        // use analytics events in the test
        await use(analyticsEvents);

        // cleanup after the test
        abort?.();
        analyticsEvents.length = 0;
        pageAnalyticsEventsMap.delete(page);
    },
});

export { expect } from '@playwright/test';
