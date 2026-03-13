import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render custom columns', async ({ page }) => {
        const table = page.getByRole('table');

        await Promise.all([
            expect(table.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible(),
            expect(table.getByRole('columnheader', { name: 'Report', exact: true })).toBeHidden(),
            expect(table.getByRole('columnheader', { name: 'File', exact: true })).toBeVisible(),
        ]);
    });

    test('should render 5 rows', async ({ page }) => {
        await expect(page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row')).toHaveCount(5);
    });
});
