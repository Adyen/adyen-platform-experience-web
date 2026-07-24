import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Default date range', () => {
    test('should default the date filter to the last 90 days preset', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByRole('button', { name: 'Date range: Last 90 days' })).toBeVisible();
    });
});
