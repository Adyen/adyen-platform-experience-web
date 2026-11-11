import type { Page } from '@playwright/test';

/** Resolves with the request that instructs the cashOut, once it is sent. */
export const waitForCashOutRequest = (page: Page) =>
    page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/cashout'));
