import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--send-to-balance-account-not-allowed';

test.describe('CashOut Request - Unavailable - Send to balance account not allowed', () => {
    test('should explain why cashOut is unavailable, with the form disabled', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€1,000.00',
            message: "Instant CashOut isn't available for this account. Contact support for help.",
        });
        await expect(root.getByRole('button', { name: 'Reach out to support' })).toHaveCount(0);
    });

    test('should offer contact support when the integration handles it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        const status = getComponentRoot(page).getByRole('status');

        await expect(status.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
        // The button already offers it, so the message doesn't also ask to contact support
        await expect(status).toContainText("Instant CashOut isn't available for this account.");
        await expect(status).not.toContainText('Contact support for help');
    });
});
