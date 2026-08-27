import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--download-error';
const INITIAL_DATETIME = '2024-07-17T00:00:00.000Z';

test.describe('Download error', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(INITIAL_DATETIME);
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Download report', exact: true }).first().click();
    });

    test('should show error toast on download failure', async ({ page }) => {
        const toast = page.getByTestId('toast');
        await expect(toast).toBeVisible();

        const errorMessage = "We couldn't download all the files. Please try again later.";
        await expect(toast.locator('[aria-live="polite"]').getByText(errorMessage, { exact: true })).toBeVisible();
    });
});
