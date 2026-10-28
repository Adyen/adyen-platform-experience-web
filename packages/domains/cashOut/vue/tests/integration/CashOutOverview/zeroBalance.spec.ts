import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--zero-balance';

test.describe('CashOut Overview - Unavailable - Zero balance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show nothing to cash out, without an alert, and not offer to start a cashOut', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('€0.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('status')).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeDisabled(),
        ]);
    });
});
