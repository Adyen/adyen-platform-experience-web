import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show error message', async ({ page }) => {
        const errorMessage = page.locator('p').filter({ hasText: "We couldn't load your reports." });

        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(errorMessage).toContainText("We couldn't load your reports."),
            expect(errorMessage).toContainText('Try refreshing the page or come back later.'),
            expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible(),
        ]);
    });
});
