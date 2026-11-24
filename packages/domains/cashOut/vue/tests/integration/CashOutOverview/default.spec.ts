import { test, expect, type Page } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectSelectorBesideTitle, recordRequests, refreshFromHeader, waitForCashOutRequest } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--default';

test.describe('CashOut Overview - Default', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    const AVAILABLE_TO_CASH_OUT_TOOLTIP =
        'You can cash out up to your pending balance, subject to a $25,000.00 cap per rolling 24-hour period. Only the amount you receive counts toward this cap.';

    // Like /setup does, the CashOut endpoints are served by cashout-ui, the others by platform-components-external.
    test('should call cashout-ui for the CashOut endpoints and platform-components-external for the others', async ({ page }) => {
        const hosts: Record<string, string> = {};
        page.on('request', request => {
            const { host, pathname } = new URL(request.url());
            const endpoint = pathname.match(/\/(setup|accounts|balanceAccounts|eligibility|availableAmounts)$/)?.[1];
            if (endpoint) hosts[endpoint] = host;
        });

        await goToStory(page, { id: STORY_ID });
        await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();

        await expect
            .poll(() => hosts)
            .toEqual({
                setup: 'platform-components-external-test.adyen.com',
                accounts: 'platform-components-external-test.adyen.com',
                balanceAccounts: 'platform-components-external-test.adyen.com',
                eligibility: 'cashout-ui-test.adyen.com',
                availableAmounts: 'cashout-ui-test.adyen.com',
            });
    });

    test.describe('Render', () => {
        test('should show what the selected balance account can cash out', async ({ page }) => {
            const root = getComponentRoot(page);

            await Promise.all([
                expect(root.getByRole('heading', { name: 'Instant CashOut' })).toBeVisible(),
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByText('Available to cash out')).toBeVisible(),
                expect(root.getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP)).toBeVisible(),
                expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
                expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
            ]);
        });

        test('should show the balance account selector on the same line as the title, to its right', async ({ page }) => {
            await expectSelectorBesideTitle(getComponentRoot(page), 'Instant CashOut');
        });

        test('should load what is available again when refreshed, keeping the selected balance account', async ({ page }) => {
            const root = getComponentRoot(page);

            expect(new URL((await refreshFromHeader(page)).url()).pathname).toContain('/cashout/eligibility');
            await Promise.all([
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            ]);
        });

        // The header tells how long ago the last update was, and keeps counting while the page stays open.
        test('should count how long ago the last update was, until refreshed', async ({ page }) => {
            await page.clock.install();
            await goToStory(page, { id: STORY_ID });
            const root = getComponentRoot(page);
            await expect(root.getByText('Last updated: less than a minute ago')).toBeVisible();

            await page.clock.fastForward('02:00');
            await expect(root.getByText('Last updated: 2 minutes ago')).toBeVisible();

            await refreshFromHeader(page);
            await expect(root.getByText('Last updated: less than a minute ago')).toBeVisible();
        });

        test('should size the start button to its label, at the start of the component', async ({ page }) => {
            const root = getComponentRoot(page);
            const content = root.getByText('Available to cash out');
            const startButton = root.getByRole('button', { name: 'Start instant CashOut' });
            await startButton.waitFor();

            const [contentBox, buttonBox] = await Promise.all([content.boundingBox(), startButton.boundingBox()]);
            const rootWidth = await root.evaluate(element => element.getBoundingClientRect().width);

            expect(buttonBox!.width).toBeLessThan(rootWidth / 2);
            expect(buttonBox!.x).toBeCloseTo(contentBox!.x, 0);
        });

        test('should explain what is available to cash out when its info icon is hovered', async ({ page }) => {
            const tooltip = page.getByTestId('focus-trap').getByText(AVAILABLE_TO_CASH_OUT_TOOLTIP);

            await getComponentRoot(page).getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP).hover();
            await tooltip.waitFor();
            await expect(tooltip).toBeVisible();
        });

        test('should show what another balance account can cash out once it is selected', async ({ page }) => {
            const root = getComponentRoot(page);

            await root.getByRole('combobox', { name: 'Balance account' }).click();
            await root.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();

            await Promise.all([
                expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
                // Whether a cashOut can be started depends on the eligibility of the selected balance account.
                expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
            ]);
        });
    });

    test.describe('Balance account selector', () => {
        // Asked for the account of the session, so it doesn't wait for the balance accounts to arrive first.
        const countAvailableAmountsRequests = (page: Page) => recordRequests(page, '/cashout/availableAmounts');

        test('should request what the balance accounts can cash out once, when the component loads', async ({ page }) => {
            const requests = countAvailableAmountsRequests(page);

            await goToStory(page, { id: STORY_ID });
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();

            expect(requests).toHaveLength(1);
        });

        // The request in the modal shares what the Overview loaded.
        test('should not request what the balance accounts can cash out again when the request opens', async ({ page }) => {
            const requests = countAvailableAmountsRequests(page);
            await goToStory(page, { id: STORY_ID });
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();
            await expect.poll(() => requests.length).toBe(1);

            await openRequestModal(page);

            await expect(
                page.getByRole('dialog', { name: 'Instant CashOut request' }).getByText('You have $220.00 available to cash out')
            ).toBeVisible();
            expect(requests).toHaveLength(1);
        });

        // So the next time the list opens it shows what they can cash out by then, while an open list keeps what it opened with.
        test('should request what the balance accounts can cash out again once the list closes', async ({ page }) => {
            const requests = countAvailableAmountsRequests(page);
            await goToStory(page, { id: STORY_ID });
            const root = getComponentRoot(page);
            const selector = root.getByRole('combobox', { name: 'Balance account' });

            await selector.click();
            await expect(root.getByRole('option', { name: 'S. Hopper - Main Account' })).toContainText('$220.00 to cash out');
            expect(requests).toHaveLength(1);

            await page.keyboard.press('Escape');
            await expect(selector).toHaveAttribute('aria-expanded', 'false');

            await expect.poll(() => requests.length).toBe(2);
        });

        // Refresh is about the selected balance account only.
        test('should not request what the balance accounts can cash out again when refreshed', async ({ page }) => {
            const requests = countAvailableAmountsRequests(page);
            await goToStory(page, { id: STORY_ID });
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();

            await refreshFromHeader(page);
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();

            expect(requests).toHaveLength(1);
        });

        test('should show what each balance account can cash out, after its id when it is named', async ({ page }) => {
            const root = getComponentRoot(page);
            await root.getByRole('combobox', { name: 'Balance account' }).click();

            await Promise.all([
                expect(root.getByRole('option', { name: 'S. Hopper - Main Account' })).toContainText(
                    'BA32272223222B5CTDQPM6W2H · $220.00 to cash out'
                ),
                expect(root.getByRole('option', { name: 'S. Hopper - Secondary Account' })).toContainText(
                    'BA32272223222B5CTDQPM6W2G · €1,000.00 to cash out'
                ),
                expect(root.getByRole('option', { name: 'BA32272223222B5CTDQPM6W2K' })).toContainText('$52.50 to cash out'),
            ]);
        });
    });

    test.describe('Request', () => {
        test('should open the request for the selected balance account, with all it can cash out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await Promise.all([
                expect(modal.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('220.00'),
                // Each value with its label, in the order they are shown.
                expect(modal.getByText('You have $220.00 available to cash out')).toBeVisible(),
                // The request in the modal has no header, so it has no refresh: only the standalone one has.
                expect(modal.getByText('Last updated', { exact: false })).toHaveCount(0),
                expect(modal.getByRole('button', { name: 'Refresh' })).toHaveCount(0),
                expect(modal.getByRole('term')).toHaveCount(1),
                expect(modal.getByRole('term')).toContainText(['Fees']),
                expect(modal.getByLabel(AVAILABLE_TO_CASH_OUT_TOOLTIP)).toBeVisible(),
                expect(modal.getByLabel('The fee is $0.50 plus 1.5% of the amount you cash out.')).toBeVisible(),
                expect(modal.getByRole('definition')).toHaveText(['$3.80']),
                expect(modal.getByRole('status')).toContainText('You will receive $216.20'),
                expect(modal.getByRole('status')).toContainText('Your money usually arrives within 5 minutes. Some transfers may take longer.'),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
            ]);
        });

        test('should list the bank accounts that can receive the cashOut first, and the others disabled with their reason', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            const options = modal.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

            await expect(options).toHaveCount(5);
            await Promise.all([
                expect(options.nth(0)).toHaveAccessibleName('NL**ABNA******4300'),
                expect(options.nth(1)).toHaveAccessibleName('GB**NWBK**********1234'),
                expect(options.nth(2)).toHaveAccessibleName('********5678'),
                expect(options.nth(2)).toBeEnabled(),
                expect(options.nth(3)).toHaveAccessibleName("GB**BARC**********5432 This account can't receive instant payouts"),
                expect(options.nth(3)).toBeDisabled(),
                expect(options.nth(4)).toHaveAccessibleName("********9012 This account can't receive payouts in USD"),
                expect(options.nth(4)).toBeDisabled(),
            ]);
        });

        test('should update the fees and what will be received for another amount', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');

            await Promise.all([
                expect(modal.getByRole('definition').filter({ hasText: '$2.00' })).toBeVisible(),
                expect(modal.getByRole('status')).toContainText('You will receive $98.00'),
            ]);
        });

        test('should keep what is available to cash out when the request is closed without cashing out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('button', { name: 'Close' }).click();

            await Promise.all([expect(modal).toBeHidden(), expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible()]);
        });
    });

    test.describe('Cash out', () => {
        test('should cash out, then show less available to cash out once the request is closed', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');
            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
            await expect(modal.getByRole('status')).toContainText('You will receive $98.00');

            const cashOutRequest = waitForCashOutRequest(page);
            await modal.getByRole('button', { name: 'Cash out now' }).click();

            // The fees are shown, but not sent: the API calculates them itself.
            expect((await cashOutRequest).postDataJSON()).toEqual({
                amount: 10000,
                currency: 'USD',
                counterparty: { transferInstrumentId: 'SE322KH223222F5GXZFNM3BGP' },
            });
            await Promise.all([
                expect(modal.getByText('CashOut successful')).toBeVisible(),
                expect(
                    modal.getByText('You can expect your money to be in your account within 5 minutes. Some transfers may take longer.')
                ).toBeVisible(),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeHidden(),
                // Only the close button of the modal: the request in the modal has no close button of its own.
                expect(modal.getByRole('button', { name: 'Close' })).toHaveCount(1),
            ]);

            await modal.getByRole('button', { name: 'Close' }).click();

            await Promise.all([expect(modal).toBeHidden(), expect(getComponentRoot(page).getByText('$120.00', { exact: true })).toBeVisible()]);
        });

        // The request can switch to another balance account than the one selected in the overview
        test('should show what the balance account cashed out from has left, keeping the selected one as it is', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Balance account' }).click();
            await modal.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();
            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');
            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
            await modal.getByRole('button', { name: 'Cash out now' }).click();
            await expect(modal.getByText('CashOut successful')).toBeVisible();
            await modal.getByRole('button', { name: 'Close' }).click();

            const root = getComponentRoot(page);
            await Promise.all([
                expect(modal).toBeHidden(),
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            ]);
            await root.getByRole('combobox', { name: 'Balance account' }).click();
            await expect(root.getByRole('option', { name: 'S. Hopper - Secondary Account' })).toContainText('€900.00 to cash out');
        });

        // Closing the modal or switching balance account would cancel the cashOut in the browser while the server may still make
        // it, and then no result would be shown.
        test('should keep the modal open and the balance account until the cashOut is sent', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
            await modal.getByRole('button', { name: 'Cash out now' }).click();

            await Promise.all([
                expect(modal.getByRole('button', { name: 'Close' })).toHaveCount(0),
                expect(modal.getByRole('combobox', { name: 'Balance account' })).toBeDisabled(),
            ]);

            await expect(modal.getByText('CashOut successful')).toBeVisible();
            await expect(modal.getByRole('button', { name: 'Close' })).toHaveCount(1);
        });

        test('should show the result right under the header of the modal', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
            await modal.getByRole('button', { name: 'Cash out now' }).click();

            const title = modal.getByText('CashOut successful');
            await title.waitFor();
            const [closeBox, titleBox] = await Promise.all([modal.getByRole('button', { name: 'Close' }).boundingBox(), title.boundingBox()]);

            // Under the header there is only the icon (24px) and the gap to the title (16px), plus the space the modal leaves under its header.
            expect(titleBox!.y - (closeBox!.y + closeBox!.height)).toBeLessThanOrEqual(64);
        });
    });
});
