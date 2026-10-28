import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--free-fees';

test.describe('CashOut Request - Free fees', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the fees as free, and that all of the amount will be received', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('definition')).toHaveText(['$220.00', 'Free']),
            expect(root.getByRole('status')).toContainText('You will receive $220.00'),
        ]);
    });
});
