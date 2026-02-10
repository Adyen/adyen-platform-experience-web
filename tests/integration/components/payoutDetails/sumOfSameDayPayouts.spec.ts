import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payout-details--sum-of-same-day-payouts';

test.describe('Sum of same-day payouts', () => {
    test('should render payout details with "Sum of same-day payouts" tag', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Sum of same-day payouts' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(1);
    });
});
