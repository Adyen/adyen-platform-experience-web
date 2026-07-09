import type { PageAnalyticsEvent } from '../fixtures/eventDispatcher/events';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: './envs/.env' });

export const goToStory = async (page: Page, params: { id: string; args?: Record<string, string> }) => {
    const { args, ...restOfParams } = params;
    const queryParams = new URLSearchParams({
        ...restOfParams,
        ...(args
            ? {
                  args: Object.entries(args)
                      .map(entry => entry.join(':'))
                      .join(';'),
              }
            : {}),
    });
    await page.goto(`/iframe.html?${queryParams.toString()}`);
};

export const expectAnalyticsEvents = async <T extends PageAnalyticsEvent>(
    analyticsEvents: T[],
    expectedEvents: [event: Awaited<T>['event'], properties: Partial<Awaited<T>['properties']>][],
    options?: { strictOrder?: boolean }
) => {
    const { strictOrder = true } = options ?? {};
    const numberOfEvents = expectedEvents.length;
    await expect.poll(() => analyticsEvents.length).toBe(numberOfEvents);
    const actualEvents = [...analyticsEvents];

    // drain the analytics events
    analyticsEvents.length = 0;

    if (strictOrder) {
        for (let i = 0; i < numberOfEvents; i++) {
            const [event, properties] = expectedEvents[i]!;
            const data = actualEvents[i]!;
            expect(data.event).toBe(event);
            expect(data.properties).toEqual(expect.objectContaining(properties));
        }
    } else {
        const expectedEventMatchers = expectedEvents.map(([event, properties]) =>
            expect.objectContaining({
                event,
                properties: expect.objectContaining(properties),
            })
        );
        expect(actualEvents).toEqual(expect.arrayContaining(expectedEventMatchers));
    }
};

export const getClipboardContent = async (page: Page) => {
    const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
    return handle.jsonValue();
};

export const setTime = async (page: Page) => {
    await page.clock.setFixedTime('2025-01-01T00:00:00.00Z');
};

export const getComponentRoot = (page: Page) => page.getByTestId('component-root');

export const clickOutsideDialog = async (dialog: Locator) => {
    await expect(dialog).toBeVisible();
    await dialog.page().click('body', { position: { x: 0, y: 0 } });
    await expect(dialog).toBeHidden();
};
