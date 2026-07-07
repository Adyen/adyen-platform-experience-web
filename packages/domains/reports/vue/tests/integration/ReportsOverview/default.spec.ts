import { test, expect, type Page } from '@playwright/test';
import { clickOutsideDialog, goToStory, selectFirstUnselectedBalanceAccount } from '@integration-components/testing/playwright/utils';
import { bentoDatePickerUtils } from '@integration-components/testing/playwright';

const STORY_ID = 'mocked-reports-reports-overview--default';
const INITIAL_DATETIME = '2024-07-17T00:00:00.000Z';
const SECONDARY_BALANCE_ACCOUNT_ID = 'BA32272223222B5CTDQPM6W2G';
const REPORTS_PER_PAGE = 10;
const BALANCE_ACCOUNT_FILTER_NAME = 'Balance account';
const DATE_RANGE_FILTER_NAME = 'Date range';

const getReportsDataGrid = (page: Page) => page.getByRole('grid');
const getReportRows = (page: Page) => getReportsDataGrid(page).getByRole('rowgroup').nth(1).getByRole('row');

// [TODO]: Address misaligned ARIA labels and attributes for Bento filter components
const getBalanceAccountFilter = (page: Page) => page.getByRole('button', { name: new RegExp(`^${BALANCE_ACCOUNT_FILTER_NAME}`) });
const getDateRangeFilter = (page: Page) => page.getByRole('button', { name: new RegExp(`^${DATE_RANGE_FILTER_NAME}`) });

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

    test.describe('Filter: Balance account', () => {
        test('should show balance account selector on load', async ({ page }) => {
            const balanceAccountFilter = getBalanceAccountFilter(page);

            await expect(balanceAccountFilter).toBeVisible();
            await expect(balanceAccountFilter).toContainText(/S\. Hopper - (Main Account)?/);
        });

        test('should open selector dialog', async ({ page }) => {
            await getBalanceAccountFilter(page).click();

            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('dialog').getByRole('option')).toHaveCount(3);
        });

        test('should list all balance accounts with description and number', async ({ page }) => {
            await getBalanceAccountFilter(page).click();

            const filterDialog = page.getByRole('dialog');

            await expect(filterDialog.getByRole('option', { selected: true })).toHaveText(/S\. Hopper - Main Account/);
            await expect(filterDialog.getByRole('option', { selected: true })).toHaveText(/BA32272223222B5CTDQPM6W2H/);
            await expect(filterDialog.getByText('S. Hopper - Secondary Account', { exact: true })).toBeVisible();
            await expect(filterDialog.getByText('BA32272223222B5CTDQPM6W2K', { exact: true })).toBeVisible();
        });

        test('should select a balance account and reload table', async ({ page }) => {
            const rows = getReportRows(page);
            await expect(rows).toHaveCount(REPORTS_PER_PAGE);

            await getBalanceAccountFilter(page).click();
            const filterDialog = page.getByRole('dialog');
            const reportsRequest = page.waitForRequest(
                request => request.url().includes('/reports') && request.url().includes(`balanceAccountId=${SECONDARY_BALANCE_ACCOUNT_ID}`)
            );

            await selectFirstUnselectedBalanceAccount(filterDialog);
            await reportsRequest;

            await expect(getBalanceAccountFilter(page)).toContainText(/S\. Hopper - (Secondary Account)?/);
            await expect(rows).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should close selector by clicking outside', async ({ page }) => {
            await getBalanceAccountFilter(page).click();
            await clickOutsideDialog(page.getByRole('dialog'));
        });
    });

    test.describe('Filter: Date range', () => {
        test('should show date filter', async ({ page }) => {
            await expect(getDateRangeFilter(page)).toBeVisible();
        });

        test('should open date picker dialog', async ({ page }) => {
            await getDateRangeFilter(page).click();
            await expect(page.getByRole('dialog').nth(0)).toBeVisible();
        });

        test('should apply a preset date range', async ({ page }) => {
            await getDateRangeFilter(page).click();
            await bentoDatePickerUtils.selectPreset(page.getByRole('dialog').nth(0), { selection: 'Year to date' });
            await expect(getReportRows(page)).toHaveCount(REPORTS_PER_PAGE);
        });

        test('should reset date filter', async ({ page }) => {
            await getDateRangeFilter(page).click();
            await bentoDatePickerUtils.selectTodayDate(page.getByRole('dialog').nth(0));

            await getDateRangeFilter(page).click();
            await bentoDatePickerUtils.reset(page.getByRole('dialog').nth(0), { defaultSelection: 'Last 30 days' });

            await expect(getReportRows(page)).toHaveCount(REPORTS_PER_PAGE);
        });
    });
});
