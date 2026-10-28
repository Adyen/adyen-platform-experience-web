import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--daily-limit-reached';

test.describe('CashOut Overview - Unavailable - Daily limit reached', () => {
    test('should explain why cashOut is unavailable, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('€0.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('status')).toContainText("You've reached the instant CashOut limit for the last 24 hours. Try again later."),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeDisabled(),
        ]);
    });

    test('should not offer contact support, as support cannot change it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        const root = getComponentRoot(page);

        await expect(root.getByRole('status')).toBeVisible();
        await expect(root.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});
