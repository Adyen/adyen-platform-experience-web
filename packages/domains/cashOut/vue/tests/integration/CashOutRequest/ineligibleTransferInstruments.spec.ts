import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--ineligible-transfer-instruments';

test.describe('CashOut Request - Ineligible transfer instruments', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should not offer to cash out before a bank account is selected', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('Select a bank account'),
            expect(root.getByRole('status')).toContainText('You will receive $216.20 USD'),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });

    test('should list the bank accounts that can receive the cashOut first, and the others disabled with their reason', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        const options = page.getByRole('listbox', { name: 'Account to deposit into' }).getByRole('option');

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

    test('should cash out to the selected bank account', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await page.getByRole('option', { name: '•••• 5678' }).click();
        await expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveText('•••• 5678');

        const cashOutRequest = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/cashout'));
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ counterparty: { transferInstrumentId: 'SE322LJ223222F5GXZFNM5D7M' } });
        await expect(root.getByText('CashOut successful')).toBeVisible();
    });
});
