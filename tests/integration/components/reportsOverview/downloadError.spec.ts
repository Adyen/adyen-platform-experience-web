import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--download-error';
const INITIAL_DATETIME = '2024-07-17T00:00:00.000Z';

test.describe('Download error', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(INITIAL_DATETIME);
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Download report', exact: true }).first().click();
    });

    test('should show error alert on download failure', async ({ page }) => {
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible();
        await expect(alert.getByText('Something went wrong with the download', { exact: true })).toBeVisible();
        await expect(alert.getByText("We couldn't download all the files. Please try again later.", { exact: true })).toBeVisible();
    });
});
