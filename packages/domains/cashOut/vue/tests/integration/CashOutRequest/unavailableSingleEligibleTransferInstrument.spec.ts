import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--unavailable-single-eligible-transfer-instrument';

test.describe('CashOut Request - Unavailable - Single eligible transfer instrument', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show only the eligible bank account, as a detail instead of a dropdown, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('You have €0.00 available to cash out')).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
            // Each value with its label, in the order they are shown: no fee, and the only bank account that could receive a cashOut.
            expect(root.getByRole('term')).toContainText(['Fees', 'Account to deposit into']),
            expect(root.getByRole('definition')).toHaveText(['--', 'GB**NWBK**********1234']),
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });
});
