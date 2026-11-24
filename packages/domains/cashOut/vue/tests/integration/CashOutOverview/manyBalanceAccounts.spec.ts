import type { Page, Request } from '@playwright/test';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { getBalanceAccountSelectorWidth, OVERVIEW_ANALYTICS, recordRequests } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--many-balance-accounts';

// From 10 balance accounts, their dropdown can be searched
test.describe('CashOut Overview - Many balance accounts', () => {
    let availableAmountsRequests: Request[];

    test.beforeEach(async ({ page, analyticsEvents }) => {
        availableAmountsRequests = recordRequests(page, '/cashout/availableAmounts');
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...OVERVIEW_ANALYTICS, balanceAccountCount: '10+' }]]);
    });

    test('should list the balance accounts whose name matches the search', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await expect(root.getByRole('option')).toHaveCount(12);

        await selector.fill('sav');

        await expect(root.getByRole('option')).toHaveCount(1);
        await expect(root.getByRole('option').first()).toHaveAccessibleName(/^S\. Hopper - Savings/);
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

        await page.keyboard.press('Escape');
        await expect(selector).toHaveAttribute('aria-expanded', 'false');
        await expect.poll(width).toBe(closedWidth);
    });

    // Selected with Enter, the list closes while what was typed is still shown, until the selector loses the focus
    test('should keep its width when a balance account found is selected with Enter', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });
        const width = () => getBalanceAccountSelectorWidth(root);

        await expect(selector).toHaveText('S. Hopper - Main Account');
        const closedWidth = await width();

        await selector.click();
        await selector.fill('Secondary');
        await expect(root.getByRole('option')).toHaveCount(1);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await Promise.all([
            expect(selector).toHaveAttribute('aria-expanded', 'false'),
            expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
        ]);
        expect(await width()).toBe(closedWidth);

        // Once it loses the focus, it shows the balance account selected
        await page.keyboard.press('Tab');
        await expect(selector).toHaveText('S. Hopper - Secondary Account');
    });

    // While it still has the focus, it shows the name of the balance account selected, all of it selected so typing searches again
    test.describe('Once a balance account found is selected', () => {
        const expectNameShownFromStart = async (page: Page, name: string) => {
            const selector = getComponentRoot(page).getByRole('combobox', { name: 'Balance account' });

            await expect(selector).toHaveValue(name);
            await expect
                .poll(() =>
                    selector.evaluate(input => {
                        const { scrollLeft, selectionDirection, selectionEnd, selectionStart, value } = input as HTMLInputElement;
                        return { scrollLeft, selectionDirection, selected: value.slice(selectionStart ?? 0, selectionEnd ?? 0) };
                    })
                )
                .toEqual({ scrollLeft: 0, selectionDirection: 'backward', selected: name });
        };

        test('with Enter, should show its name from the start', async ({ page }) => {
            const selector = getComponentRoot(page).getByRole('combobox', { name: 'Balance account' });

            await selector.click();
            await selector.fill('Payroll');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            await expectNameShownFromStart(page, 'S. Hopper - Payroll');
        });

        test('with the mouse, should show its name from the start', async ({ page }) => {
            const root = getComponentRoot(page);
            const selector = root.getByRole('combobox', { name: 'Balance account' });

            await selector.click();
            await selector.fill('Payroll');
            await root.getByRole('option', { name: /^S\. Hopper - Payroll/ }).click();

            await expectNameShownFromStart(page, 'S. Hopper - Payroll');
        });
    });

    test('should tell when no balance account matches the search', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await selector.fill('Payouts');

        await Promise.all([expect(root.getByText('No options match this search')).toBeVisible(), expect(root.getByRole('option')).toHaveCount(0)]);
    });

    test('should show what the balance account found can cash out once it is selected', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await selector.fill('Savings');
        await root.getByRole('option', { name: /^S\. Hopper - Savings/ }).click();

        await Promise.all([
            expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });

    // As without the search, so the next time the list opens it shows what they can cash out by then
    test('should request what the balance accounts can cash out again once the list closes after a search', async ({ page }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await selector.fill('sav');
        // Once it shows what it can cash out, the balance accounts have been listed with what was requested when the component loaded
        await expect(root.getByRole('option', { name: /^S\. Hopper - Savings/ })).toContainText('€1,000.00 to cash out');
        expect(availableAmountsRequests).toHaveLength(1);

        await page.keyboard.press('Escape');
        await expect(selector).toHaveAttribute('aria-expanded', 'false');

        await expect.poll(() => availableAmountsRequests.length).toBe(2);
    });

    test('should tell a balance account was selected from a search', async ({ page, analyticsEvents }) => {
        const root = getComponentRoot(page);
        const selector = root.getByRole('combobox', { name: 'Balance account' });

        await selector.click();
        await selector.fill('sav');
        await root.getByRole('option', { name: /^S\. Hopper - Savings/ }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed balance account', { ...OVERVIEW_ANALYTICS, usedSearch: true, balanceAccountCount: '10+' }],
        ]);
    });
});
