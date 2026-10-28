import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--send-to-balance-account-not-allowed';

test.describe('CashOut Request - Unavailable - Send to balance account not allowed', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should explain why cashOut is unavailable, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('definition').filter({ hasText: '€1,000.00 EUR' })).toBeVisible(),
            expect(root.getByRole('status')).toContainText("Instant CashOut isn't available for this account. Contact support for help."),
            // The standalone component doesn't offer contact support.
            expect(root.getByRole('button', { name: 'Reach out to support' })).toHaveCount(0),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
            expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Cancel' })).toBeEnabled(),
        ]);
    });
});
