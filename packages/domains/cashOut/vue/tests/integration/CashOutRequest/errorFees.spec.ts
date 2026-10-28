import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--fees-error';

test.describe('CashOut Request - Error - Fees', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show an error instead of the form, keeping the balance account selector', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(root.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
        ]);
    });
});
