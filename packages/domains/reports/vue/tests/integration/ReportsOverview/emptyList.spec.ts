import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the empty state instead of the table', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('No reports found', { exact: true })).toBeVisible(),
            expect(page.getByText('Try a different search or reset your filters, and we’ll try again.', { exact: true })).toBeVisible(),
            expect(page.getByRole('grid')).toHaveCount(0),
        ]);
    });
});
