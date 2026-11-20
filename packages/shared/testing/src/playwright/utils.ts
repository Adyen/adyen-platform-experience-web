import type { PageAnalyticsEvent } from '../fixtures/eventDispatcher/events';
import type { Locator, Page, Request, Response } from '@playwright/test';
import { expect } from '@playwright/test';
import { CORE_EVENT_NAMES } from '@integration-components/core/EventDispatcher/eventDispatcher/core-events';
import { BalanceAccountFilter } from './utils/filters';
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

export const updateStoryArgs = async (page: Page, storyId: string, updatedArgs: Record<string, unknown>) => {
    await page.evaluate(
        ({ storyId, updatedArgs }) => {
            (
                window as unknown as Window & {
                    __STORYBOOK_PREVIEW__: { channel: { emit: (event: string, payload: unknown) => void } };
                }
            ).__STORYBOOK_PREVIEW__.channel.emit('updateStoryArgs', { storyId, updatedArgs });
        },
        { storyId, updatedArgs }
    );
};

/**
 * Core lifecycle events (Initiated core, Customized component style/data, Updated theme) are
 * emitted by the SDK itself at mount and on runtime updates, independent of any component
 * interaction. Interaction specs should not have to couple to them, so they are skipped
 * while matching — unless a spec explicitly lists them in its expectations, which is how
 * the core-event integration specs assert them.
 */
const CORE_LIFECYCLE_EVENT_NAMES = new Set<string>(Object.values(CORE_EVENT_NAMES));

const isCoreLifecycleEvent = (event: PageAnalyticsEvent): boolean => CORE_LIFECYCLE_EVENT_NAMES.has(event.event);

const isExpectedCoreEvent = (event: PageAnalyticsEvent, expectedEventNames: readonly string[]): boolean => expectedEventNames.includes(event.event);

const isRelevantEvent = (event: PageAnalyticsEvent, expectedEventNames: readonly string[]): boolean =>
    !isCoreLifecycleEvent(event) || isExpectedCoreEvent(event, expectedEventNames);

export const expectAnalyticsEvents = async <T extends PageAnalyticsEvent>(
    analyticsEvents: T[],
    expectedEvents: [event: Awaited<T>['event'], properties: Partial<Awaited<T>['properties']>][],
    options?: { strictOrder?: boolean }
) => {
    const { strictOrder = true } = options ?? {};
    const numberOfEvents = expectedEvents.length;
    const expectedEventNames = expectedEvents.map(([event]) => event);
    await expect.poll(() => analyticsEvents.filter(event => isRelevantEvent(event, expectedEventNames)).length).toBe(numberOfEvents);
    const actualEvents = [...analyticsEvents];

    // drain the analytics events
    analyticsEvents.length = 0;

    const relevantEvents = actualEvents.filter(event => isRelevantEvent(event, expectedEventNames));

    if (strictOrder) {
        for (let i = 0; i < numberOfEvents; i++) {
            const [event, properties] = expectedEvents[i]!;
            const data = relevantEvents[i]!;
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
        expect(relevantEvents).toEqual(expect.arrayContaining(expectedEventMatchers));
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

export const expectPaginationReset = async <FilterValue>({
    endpointPath,
    isFilterRequest,
    page,
    triggerFilterChange,
}: {
    endpointPath: string;
    isFilterRequest: (request: Request, filterValue: FilterValue) => boolean;
    page: Page;
    triggerFilterChange: () => Promise<FilterValue>;
}) => {
    const nextPageButton = page.getByRole('button', { name: /Next page/i });
    const previousPageButton = page.getByRole('button', { name: /Previous page/i });
    const nextPageResponse = page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.pathname.endsWith(endpointPath) && url.searchParams.has('cursor');
    });

    await nextPageButton.click();
    await nextPageResponse;
    await expect(previousPageButton).toBeEnabled();

    const filterRequests: Request[] = [];
    const filterResponses: Response[] = [];
    const isEndpointUrl = (url: string) => new URL(url).pathname.endsWith(endpointPath);
    const collectFilterRequests = (request: Request) => {
        if (isEndpointUrl(request.url())) filterRequests.push(request);
    };
    const collectFilterResponses = (response: Response) => {
        if (isEndpointUrl(response.url())) filterResponses.push(response);
    };
    page.on('request', collectFilterRequests);
    page.on('response', collectFilterResponses);

    let filterValue!: FilterValue;
    try {
        filterValue = await triggerFilterChange();
        await expect.poll(() => filterResponses.some(response => isFilterRequest(response.request(), filterValue))).toBe(true);
    } finally {
        page.off('request', collectFilterRequests);
        page.off('response', collectFilterResponses);
    }

    const matchingRequests = filterRequests.filter(request => isFilterRequest(request, filterValue));
    expect(matchingRequests.length).toBeGreaterThan(0);
    matchingRequests.forEach(request => expect(new URL(request.url()).searchParams.get('cursor')).toBeNull());

    const matchingResponses = filterResponses.filter(response => isFilterRequest(response.request(), filterValue));
    expect(matchingResponses.length).toBeGreaterThan(0);
    const filteredResponse = matchingResponses[matchingResponses.length - 1];
    if (!filteredResponse) throw new Error(`Expected a matching ${endpointPath} response after filtering`);

    const responseBody: unknown = await filteredResponse.json();
    if (typeof responseBody !== 'object' || responseBody === null || !('data' in responseBody) || !Array.isArray(responseBody.data)) {
        throw new Error(`Expected the ${endpointPath} response to contain a data array`);
    }

    if (responseBody.data.length > 0) {
        await expect(previousPageButton).toBeDisabled();
    } else {
        await expect(previousPageButton).toHaveCount(0);
        await expect(nextPageButton).toHaveCount(0);
    }
};

export const expectBalanceAccountPaginationReset = async ({
    endpointPath,
    page,
    variant,
}: {
    endpointPath: string;
    page: Page;
    variant: keyof typeof BalanceAccountFilter;
}) => {
    const Filter = BalanceAccountFilter[variant];
    await expectPaginationReset({
        endpointPath,
        isFilterRequest: (request, balanceAccountId) => new URL(request.url()).searchParams.get('balanceAccountId') === balanceAccountId,
        page,
        triggerFilterChange: () => new Filter(page).selectFirstUnselected(),
    });
};
