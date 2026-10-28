import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--zero-balance';

test.describe('CashOut Request - Unavailable - Zero balance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show nothing to cash out, without an alert, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('definition').filter({ hasText: '€0.00 EUR' })).toBeVisible(),
            expect(root.getByRole('status')).toHaveCount(0),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Cancel' })).toBeEnabled(),
        ]);
    });
});
