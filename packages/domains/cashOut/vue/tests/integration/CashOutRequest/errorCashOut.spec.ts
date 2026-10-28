import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--cash-out-error';

test.describe('CashOut Request - Error - Cash out', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await page.getByRole('option', { name: 'NL91 **** **** 4300' }).click();
        await root.getByRole('button', { name: 'Cash out now' }).click();
    });

    test('should show the error screen instead of the form, with a close button', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('alert')).toContainText('Something went wrong.'),
            expect(root.getByRole('alert')).toContainText('Please try again.'),
            expect(root.getByRole('button', { name: 'Close' })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
            expect(root.getByText('CashOut successful')).toHaveCount(0),
        ]);
    });
});
