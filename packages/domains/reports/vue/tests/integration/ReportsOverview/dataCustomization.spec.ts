import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--data-customization';
const REPORT_DATE_REGEX = /^\w{3} \d{1,2}, \d{4}$/;

test.describe('Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render custom columns and correct number of rows', async ({ page }) => {
        const dataGrid = page.getByRole('grid');

        await expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Report', exact: true })).toBeHidden();

        const rows = dataGrid.getByRole('rowgroup').nth(1).getByRole('row');
        await expect(rows).toHaveCount(5);
    });

    test('should render custom data in rows', async ({ page }) => {
        const dataGrid = page.getByRole('grid');
        const rows = dataGrid.getByRole('rowgroup').nth(1).getByRole('row');

        await expect(rows.first().getByRole('link', { name: 'Summary', exact: true })).toBeVisible();
        await expect(rows.first().getByRole('button', { name: 'Send email', exact: true })).toBeVisible();
    });

    test('should hide the date column in a small container', async ({ page }) => {
        const dataGrid = page.getByRole('grid');
        const dateColumn = dataGrid.getByRole('columnheader', { name: 'Date', exact: true });
        const firstRow = dataGrid.getByRole('rowgroup').nth(1).getByRole('row').first();

        await expect(dateColumn).toBeVisible();
        await page.setViewportSize({ width: 479, height: 800 });

        await expect(dateColumn).toBeHidden();
        await expect(firstRow.getByText(REPORT_DATE_REGEX)).toHaveCount(1);
    });
});
