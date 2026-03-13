import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-reports-reports-overview--single-balance-account';
const NOW = '2024-07-17T00:00:00.000Z';
const REPORTS_PER_PAGE = 10;

test.describe('Single balance account', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test('should hide balance account selector', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
    });

    test('should render table with data', async ({ page }) => {
        await expect(page.getByRole('table')).toBeVisible();
        await expect(page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row')).toHaveCount(REPORTS_PER_PAGE);
    });
});
