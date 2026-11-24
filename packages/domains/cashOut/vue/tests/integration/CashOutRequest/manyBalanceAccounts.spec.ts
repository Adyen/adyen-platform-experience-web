import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { getBalanceAccountSelectorWidth } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--many-balance-accounts';

// From 10 balance accounts, their dropdown can be searched
test.describe('CashOut Request - Many balance accounts', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should list the balance accounts whose name matches the search', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await expect(root.getByRole('option')).toHaveCount(12);

        await selector.fill('ra');

        await expect(root.getByRole('option')).toHaveCount(2);
        await Promise.all([
            expect(root.getByRole('option').nth(0)).toHaveAccessibleName(/^S\. Hopper - Operations/),
            expect(root.getByRole('option').nth(1)).toHaveAccessibleName(/^S\. Hopper - Travel/),
        ]);
    });

    // Open, it shows what is typed instead of the selected balance account, which it is as wide as while closed
    test('should keep its width while the balance accounts are searched', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });
        const width = () => getBalanceAccountSelectorWidth(root);

        await expect(selector).toHaveText('S. Hopper - Main Account');
        const closedWidth = await width();

        await selector.click();
        await expect(root.getByRole('option')).toHaveCount(12);
        expect(await width()).toBe(closedWidth);

        await selector.fill('t');
        await expect(root.getByRole('option').first()).toBeVisible();
        expect(await width()).toBe(closedWidth);
    });

    test('should show the form for the balance account found once it is selected', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await selector.fill('Savings');
        await root.getByRole('option', { name: /^S\. Hopper - Savings/ }).click();

        await Promise.all([
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('1000.00'),
            expect(root.getByText('You have €1,000.00 available to cash out')).toBeVisible(),
        ]);
    });
});
