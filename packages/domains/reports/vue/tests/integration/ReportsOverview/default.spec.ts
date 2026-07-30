import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { testBalanceAccountFilter, testDateRangeFilter } from '../../../../fixtures/integration/filters';

const STORY_ID = 'mocked-reports-reports-overview--default';
const INITIAL_DATETIME = new Date('2024-07-17T00:00:00.000Z').getTime();
const REPORTS_PER_PAGE = 10;

const getReportsDataGrid = (page: Page) => page.getByRole('grid');
const getReportRows = (page: Page) => getReportsDataGrid(page).getByRole('rowgroup').nth(1).getByRole('row');

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(INITIAL_DATETIME);
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Render', () => {
        test('should render the component title', async ({ page }) => {
            await expect(page.getByText('Reports', { exact: true })).toBeVisible();
        });

        test('should render table with correct columns', async ({ page }) => {
            const dataGrid = getReportsDataGrid(page);

            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Report', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader')).toHaveCount(3);
        });

        test('should render report rows', async ({ page }) => {
            await expect(getReportRows(page)).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should render download button per row', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Download report', exact: true })).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should render pagination controls', async ({ page }) => {
            const pagination = page.getByRole('navigation', { name: /Pagination/i });

            await expect(pagination.getByText('items')).toBeVisible();
            await expect(pagination.getByRole('combobox', { name: /Items/i, disabled: false, expanded: false })).toBeVisible();
            await expect(pagination.getByRole('button', { name: /Previous page/i, disabled: true })).toBeVisible();
            await expect(pagination.getByRole('button', { name: /Next page/i, disabled: false })).toBeVisible();
        });
    });
});

test.describe('Filters', () => {
    const now = INITIAL_DATETIME;
    const variant = 'Bento';

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(now);
        await goToStory(page, { id: STORY_ID });
    });

    testBalanceAccountFilter({ variant, getReportRows, reportsPerPage: REPORTS_PER_PAGE });
    testDateRangeFilter({ variant, now });
});
