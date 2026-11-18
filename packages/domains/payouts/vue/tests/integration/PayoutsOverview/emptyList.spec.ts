import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render "No payouts found" message', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('No payouts found', { exact: true })).toBeVisible(),
            expect(page.getByText('Try a different search or reset your filters, and we’ll try again.', { exact: true })).toBeVisible(),
        ]);
    });

    test('should not render the data grid', async ({ page }) => {
        await expect(page.getByRole('grid')).toHaveCount(0);
    });

    test('should not render pagination buttons', async ({ page }) => {
        await Promise.all([
            expect(page.getByRole('button', { name: /Previous page/i })).toHaveCount(0),
            expect(page.getByRole('button', { name: /Next page/i })).toHaveCount(0),
        ]);
    });
});
