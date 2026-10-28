import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--balance-accounts-error';

test.describe('CashOut Overview - Error - Balance accounts', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show an error, without a balance account selector', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('heading', { name: 'Instant CashOut' })).toBeVisible(),
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(root.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toHaveCount(0),
        ]);
    });

    test('should load the balance accounts again on refresh', async ({ page }) => {
        const balanceAccountsRequest = page.waitForRequest(request => request.url().includes('/balanceAccounts'));

        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await balanceAccountsRequest;
    });
});
