import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--send-to-balance-account-not-allowed';

test.describe('CashOut Overview - Unavailable - Send to balance account not allowed', () => {
    test('should explain that cashOut is not allowed for this account, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('status')).toContainText("Instant CashOut isn't available for this account. Contact support for help."),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Reach out to support' })).toBeHidden(),
        ]);
    });

    test('should offer contact support when the integration handles it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await expect(getComponentRoot(page).getByRole('status').getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
