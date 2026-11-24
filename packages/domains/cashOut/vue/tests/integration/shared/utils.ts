import { expect, type Locator, type Page, type Request } from '@playwright/test';
import { getComponentRoot } from '@integration-components/testing/playwright/utils';

/** Resolves with the request that instructs the cashOut, once it is sent. */
export const waitForCashOutRequest = (page: Page) =>
    page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/cashout'));

/** Resolves with the next request for the eligibility of a balance account. */
export const waitForEligibilityRequest = (page: Page) =>
    page.waitForRequest(request => request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/cashout/eligibility'));

/**
 * Records the requests whose path ends with `path`, such as `/cashout/availableAmounts`, from before the story loads. Unlike
 * waiting for them, it has no timeout to run out while the story loads.
 */
export const recordRequests = (page: Page, path: string) => {
    const requests: Request[] = [];
    page.on('request', request => {
        if (new URL(request.url()).pathname.endsWith(path)) requests.push(request);
    });
    return requests;
};

/** The width of the balance account selector, which it keeps while its balance accounts are searched. */
export const getBalanceAccountSelectorWidth = async (root: Locator) => (await root.getByTestId('balance-account-selector').boundingBox())?.width;

/** What getState() told the state stories, shown once they decided whether to show the component. */
export const expectToldState = (page: Page, state: { isAvailable: boolean; restrictions?: string[] }) =>
    expect(page.getByRole('status', { name: 'getState() result' })).toHaveText(JSON.stringify(state));

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

/**
 * Opens and closes the list of balance accounts, after which the component loads what they can cash out again. Once the list shows what
 * the selected one can cash out, `mainAccountAmount`, they have been loaded.
 */
export const loadAvailableAmountsAgain = async (page: Page, mainAccountAmount = '$220.00') => {
    const root = getComponentRoot(page);
    const selector = root.getByRole('combobox', { name: 'Balance account' });
    await selector.click();
    await expect(root.getByRole('option', { name: 'S. Hopper - Main Account' })).toContainText(`${mainAccountAmount} to cash out`);
    await page.keyboard.press('Escape');
    await expect(selector).toHaveAttribute('aria-expanded', 'false');
};

/** What every analytics event of each part of the components is sent with. */
export const OVERVIEW_ANALYTICS = { componentName: 'cashOutOverview', category: 'CashOut overview component', subCategory: 'Overview' } as const;
/** The request in the modal of the overview is part of the overview. */
export const OVERVIEW_REQUEST_ANALYTICS = { ...OVERVIEW_ANALYTICS, subCategory: 'Request' } as const;
export const REQUEST_ANALYTICS = { componentName: 'cashOutRequest', category: 'CashOut request component', subCategory: 'Request' } as const;
