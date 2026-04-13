import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payout-details--sum-of-same-day-payouts';

test.describe('Sum of same-day payouts', () => {
    test('should render payout details with "Sum of same-day payouts" tag', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await Promise.all([
            expect(page.getByText('Sum of same-day payouts', { exact: true })).toBeVisible(),
            expect(page.getByText('Sum of same-day payouts', { exact: true })).toHaveCount(1),
        ]);
    });
});
