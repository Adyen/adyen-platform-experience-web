import { test, expect } from '@playwright/test';
import { getTranslatedKey, goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show empty state message', async ({ page }) => {
        await expect(page.getByText(getTranslatedKey('reports.overview.errors.listEmpty'), { exact: true })).toBeVisible();
    });

    test('should show update filters hint', async ({ page }) => {
        await expect(page.getByText(getTranslatedKey('common.errors.updateFilters'), { exact: true })).toBeVisible();
    });

    test('should still render column headers', async ({ page }) => {
        const table = page.getByRole('table');

        await Promise.all([
            expect(table.getByRole('columnheader', { name: getTranslatedKey('reports.overview.list.fields.createdAt'), exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: getTranslatedKey('reports.overview.list.fields.reportType'), exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: getTranslatedKey('reports.overview.list.fields.reportFile'), exact: true })).toBeVisible(),
        ]);
    });
});
