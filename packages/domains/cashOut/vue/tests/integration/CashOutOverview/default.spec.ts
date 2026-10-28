import { test, expect, type Page } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--default';

test.describe('CashOut Overview - Default', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    const getRequestModal = (page: Page) => page.getByRole('dialog', { name: 'Instant CashOut request' });

    const openRequestModal = async (page: Page) => {
        await getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' }).click();
        await expect(getRequestModal(page)).toBeVisible();
        return getRequestModal(page);
    };

    test.describe('Render', () => {
        test('should show what the selected balance account can cash out', async ({ page }) => {
            const root = getComponentRoot(page);

            await Promise.all([
                expect(root.getByRole('heading', { name: 'Instant CashOut' })).toBeVisible(),
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByText('Available to cash out')).toBeVisible(),
                expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
                expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
            ]);
        });

        test('should show what another balance account can cash out once it is selected', async ({ page }) => {
            const root = getComponentRoot(page);

            await root.getByRole('combobox', { name: 'Balance account' }).click();
            await page.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();

            await expect(root.getByText('€1,000.00', { exact: true })).toBeVisible();
        });
    });

    test.describe('Request', () => {
        test('should open the request for the selected balance account, with all it can cash out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await Promise.all([
                expect(modal.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('220.00'),
                expect(modal.getByRole('definition').filter({ hasText: '$220.00 USD' })).toBeVisible(),
                expect(modal.getByRole('definition').filter({ hasText: '$3.80 USD' })).toBeVisible(),
                expect(modal.getByRole('status')).toContainText('You will receive $216.20 USD'),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
            ]);
        });

        test('should list the bank accounts that can receive the cashOut first, and the others disabled with their reason', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            const options = modal.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

            await expect(options).toHaveCount(5);
            await Promise.all([
                expect(options.nth(0)).toHaveAccessibleName('NL91 **** **** 4300'),
                expect(options.nth(1)).toHaveAccessibleName('•••• 1234'),
                expect(options.nth(2)).toHaveAccessibleName('•••• 5678'),
                expect(options.nth(2)).toBeEnabled(),
                expect(options.nth(3)).toHaveAccessibleName("GB33 **** **** 5432 This account can't receive instant payouts."),
                expect(options.nth(3)).toBeDisabled(),
                expect(options.nth(4)).toHaveAccessibleName("•••• 9012 This account can't receive payouts in USD."),
                expect(options.nth(4)).toBeDisabled(),
            ]);
        });

        test('should update the fees and what will be received for another amount', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');

            await Promise.all([
                expect(modal.getByRole('definition').filter({ hasText: '$2.00 USD' })).toBeVisible(),
                expect(modal.getByRole('status')).toContainText('You will receive $98.00 USD'),
            ]);
        });

        test('should keep what is available to cash out when the request is closed without cashing out', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('button', { name: 'Close' }).click();

            await expect(modal).toBeHidden();
            await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();
        });
    });

    test.describe('Cash out', () => {
        test('should cash out, then show less available to cash out once the request is closed', async ({ page }) => {
            const modal = await openRequestModal(page);

            await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');
            await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
            await modal.getByRole('option', { name: 'NL91 **** **** 4300' }).click();
            await expect(modal.getByRole('status')).toContainText('You will receive $98.00 USD');
            await modal.getByRole('button', { name: 'Cash out now' }).click();

            await Promise.all([
                expect(modal.getByText('CashOut successful')).toBeVisible(),
                expect(modal.getByText('You can expect your money to be in your account within 30 minutes.')).toBeVisible(),
                expect(modal.getByRole('button', { name: 'Cash out now' })).toBeHidden(),
            ]);

            await modal.getByRole('button', { name: 'Close' }).click();

            await expect(modal).toBeHidden();
            await expect(getComponentRoot(page).getByText('$120.00', { exact: true })).toBeVisible();
        });
    });
});
