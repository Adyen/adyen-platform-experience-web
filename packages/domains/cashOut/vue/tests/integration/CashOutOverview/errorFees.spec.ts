import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--fees-error';

test.describe('CashOut Overview - Error - Fees', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the overview as usual, as fees only load in the request', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });

    test('should show an error in the request, keeping the balance account selector', async ({ page }) => {
        await getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' }).click();
        const modal = page.getByRole('dialog', { name: 'Instant CashOut request' });

        await Promise.all([
            expect(modal.getByText('Something went wrong.')).toBeVisible(),
            expect(modal.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(modal.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(modal.getByRole('combobox', { name: 'Balance account' })).toBeVisible(),
            expect(modal.getByRole('button', { name: 'Cash out now' })).toHaveCount(0),
        ]);
    });
});
