import type { PageAnalyticsEvent } from '../fixtures/eventDispatcher/events';
import type { Locator, Page, Request } from '@playwright/test';
import { expect } from '@playwright/test';
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
    const collectFilterRequests = (request: Request) => {
        if (new URL(request.url()).pathname.endsWith(endpointPath)) filterRequests.push(request);
    };
    page.on('request', collectFilterRequests);

    let filterValue!: FilterValue;
    try {
        filterValue = await triggerFilterChange();
        await expect.poll(() => filterRequests.some(request => isFilterRequest(request, filterValue))).toBe(true);
    } finally {
        page.off('request', collectFilterRequests);
    }

    const matchingRequests = filterRequests.filter(request => isFilterRequest(request, filterValue));
    expect(matchingRequests.length).toBeGreaterThan(0);
    matchingRequests.forEach(request => expect(new URL(request.url()).searchParams.get('cursor')).toBeNull());
    await expect(previousPageButton).toBeDisabled();
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
