import { test, expect } from '@playwright/test';
import { getTranslatedKey, goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--download-error';
const NOW = '2024-07-17T00:00:00.000Z';

test.describe('Download error', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
        await page
            .getByRole('button', { name: getTranslatedKey('reports.overview.list.controls.downloadReport.label'), exact: true })
            .first()
            .click();
    });

    test('should show error alert on download failure', async ({ page }) => {
        await expect(page.getByRole('alert')).toBeVisible();
    });

    test('should show correct error title', async ({ page }) => {
        await expect(page.getByRole('alert').getByText(getTranslatedKey('reports.overview.errors.download'), { exact: true })).toBeVisible();
    });

    test('should show correct error description', async ({ page }) => {
        await expect(page.getByRole('alert').getByText(getTranslatedKey('reports.overview.errors.tooManyDownloads'), { exact: true })).toBeVisible();
    });
});
