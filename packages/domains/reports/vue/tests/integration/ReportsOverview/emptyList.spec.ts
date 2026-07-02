import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show empty state and table headers', async ({ page }) => {
        await expect(page.getByText('No reports found', { exact: true })).toBeVisible();
        await expect(page.getByText('Try a different search or reset your filters, and we’ll try again.', { exact: true })).toBeVisible();

        const dataGrid = page.getByRole('grid');

        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Report', exact: true })).toBeVisible();
    });
});
