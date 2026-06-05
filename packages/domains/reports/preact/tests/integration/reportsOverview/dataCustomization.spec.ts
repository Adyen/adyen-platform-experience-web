import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render custom columns and correct number of rows', async ({ page }) => {
        const table = page.getByRole('table');

        await Promise.all([
            expect(table.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: 'Report', exact: true })).toBeHidden(),
            expect(table.getByRole('columnheader', { name: 'File', exact: true })).toBeVisible(),
        ]);

        const rows = table.getByRole('rowgroup').nth(1).getByRole('row');
        await expect(rows).toHaveCount(5);
    });

    test('should render custom data in rows', async ({ page }) => {
        const table = page.getByRole('table');
        const rows = table.getByRole('rowgroup').nth(1).getByRole('row');

        await expect(rows.first().getByRole('link', { name: 'Summary', exact: true })).toBeVisible();
        await expect(rows.first().getByRole('button', { name: 'Send email', exact: true })).toBeVisible();
    });
});
