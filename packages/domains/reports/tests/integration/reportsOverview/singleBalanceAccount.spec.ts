import { test, expect } from '@playwright/test';
import { goToStory } from '../../../../../../tests/utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--single-balance-account';
const INITIAL_DATETIME = '2024-07-17T00:00:00.000Z';
const REPORTS_PER_PAGE = 10;

test.describe('Single balance account', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(INITIAL_DATETIME);
        await goToStory(page, { id: STORY_ID });
    });

    test('should hide balance account selector and render table', async ({ page }) => {
        const table = page.getByRole('table');
        const rows = table.getByRole('rowgroup').nth(1).getByRole('row');

        await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
        await expect(table).toBeVisible();
        await expect(rows).toHaveCount(REPORTS_PER_PAGE);
    });
});
