import { expect, test, type Page } from '@playwright/test';
import { expectBalanceAccountPaginationReset, goToStory } from '@integration-components/testing/playwright/utils';
import { testBalanceAccountFilter, testDateRangeFilter } from '../../../../fixtures/integration/filters';

const STORY_ID = 'mocked-reports-reports-overview--default';
const REPORTS_PER_PAGE = 10;

const getReportsTable = (page: Page) => page.getByRole('table');
const getReportRows = (page: Page) => getReportsTable(page).getByRole('rowgroup').nth(1).getByRole('row');

test.describe('Default', () => {
    const NOW = Date.now();

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Render', () => {
        test('should render the component title', async ({ page }) => {
            await expect(page.getByText('Reports', { exact: true })).toBeVisible();
        });

        test('should render table with correct columns', async ({ page }) => {
            const table = getReportsTable(page);

            await expect(table.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: 'Report', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: 'File', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader')).toHaveCount(3);
        });

        test('should render report rows', async ({ page }) => {
            await expect(getReportRows(page)).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should render download button per row', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Download report', exact: true })).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should render pagination controls', async ({ page }) => {
            const pagination = page.getByLabel('Reports pagination');

            await expect(pagination.getByText('Showing ')).toBeVisible();
            await expect(pagination.getByRole('button', { name: 'Reports per page', exact: true })).toBeVisible();
            await expect(pagination.getByRole('button', { name: 'Previous page', exact: true })).toBeVisible();
            await expect(pagination.getByRole('button', { name: 'Next page', exact: true })).toBeVisible();
        });
    });
});

test.describe('Filters', () => {
    const now = Date.now();
    const variant = 'Default';

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(now);
        await goToStory(page, { id: STORY_ID });
    });

    testBalanceAccountFilter({ variant, getReportRows, reportsPerPage: REPORTS_PER_PAGE });
    testDateRangeFilter({ variant, now });

    test('should reset pagination when selecting another balance account', async ({ page }) => {
        await expectBalanceAccountPaginationReset({ endpointPath: '/reports', page, variant });
        await expect(getReportRows(page)).toHaveCount(REPORTS_PER_PAGE);
    });
});
