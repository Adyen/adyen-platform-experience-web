import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--cash-out-in-progress';

test.describe('CashOut Overview - Unavailable - CashOut in progress', () => {
    test('should explain why cashOut is unavailable, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€1,000.00',
            message: "Instant CashOut isn't available because a previous CashOut is still being processed. Try again once it's complete.",
        });
    });

    test('should not offer contact support, as support cannot change it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        const root = getComponentRoot(page);

        await expect(root.getByRole('status')).toBeVisible();
        await expect(root.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});
