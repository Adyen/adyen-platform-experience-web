import { expect, type Locator, type Page } from '@playwright/test';
import { getComponentRoot } from '@integration-components/testing/playwright/utils';

/** Resolves with the request that instructs the cashOut, once it is sent. */
export const waitForCashOutRequest = (page: Page) =>
    page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/cashout'));

/** Resolves with the next request for the eligibility of a balance account. */
export const waitForEligibilityRequest = (page: Page) =>
    page.waitForRequest(request => request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/cashout/eligibility'));

/** The balance account selector is on the line of the title, to its right. */
export const expectSelectorBesideTitle = async (root: Locator, title: string) => {
    const selector = root.getByRole('combobox', { name: 'Balance account' });
    await selector.waitFor();

    const [titleBox, selectorBox] = await Promise.all([root.getByRole('heading', { name: title }).boundingBox(), selector.boundingBox()]);
    const titleMiddle = titleBox!.y + titleBox!.height / 2;

    expect(selectorBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width);
    expect(titleMiddle).toBeGreaterThan(selectorBox!.y);
    expect(titleMiddle).toBeLessThan(selectorBox!.y + selectorBox!.height);
};

/** Refreshes from the header, next to the time of the last update, and resolves with the eligibility request it sends. */
export const refreshFromHeader = async (page: Page) => {
    const root = getComponentRoot(page);
    await expect(root.getByText('Last updated', { exact: false })).toBeVisible();

    const eligibilityRequest = waitForEligibilityRequest(page);
    await root.getByRole('button', { name: 'Refresh' }).click();
    return eligibilityRequest;
};
