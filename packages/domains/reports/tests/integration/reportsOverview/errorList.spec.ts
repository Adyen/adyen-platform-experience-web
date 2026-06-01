import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show error message', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText("We couldn't load your reports.", { exact: false })).toBeVisible(),
            expect(page.getByText('Try refreshing the page or come back later.', { exact: false })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible(),
        ]);
    });
});
