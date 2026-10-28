import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--no-instant-reachable-transfer-instruments';

test.describe('CashOut Overview - Unavailable - No instant reachable transfer instruments', () => {
    test('should explain why cashOut is unavailable, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('€1,000.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('status')).toContainText(
                "Instant CashOut isn't available because you don't have a bank account that can receive instant payouts. Please onboard an additional bank account."
            ),
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
