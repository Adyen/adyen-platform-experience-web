import {
    downloadTransactions,
    goToView,
    openExportPopover,
    selectSingleCategoryFromMultiSelectFilter,
    selectSingleCurrencyFromMultiSelectFilter,
    setExactPspReference,
} from './shared/utils';
import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-overview--default';

test.describe('Default', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('Transactions view: Rendering', () => {
        test('should render segmented controls for switching views', async ({ page }) => {
            await expect(page.getByRole('radio', { name: 'Transactions', exact: true, checked: true })).toBeVisible();
            await expect(page.getByRole('radio', { name: 'Insights', exact: true, checked: false })).toBeVisible();
            await expect(page.getByRole('radio')).toHaveCount(2);
        });

        test('should render filter bar', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Type', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'PSP reference', exact: true })).toBeVisible();
        });

        test('should render transactions export button', async ({ page }) => {
            const exportButton = page.getByRole('button', { name: 'Export', exact: true });
            await expect(exportButton).toBeVisible();
            await expect(exportButton).toBeEnabled();
        });

        test('should render transaction totals and account balances', async ({ page }) => {
            let balancesCard = page.getByRole('button', { name: 'Show all account balances', exact: true, expanded: false });
            let totalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: false });

            await expect(balancesCard).toBeVisible();
            await expect(balancesCard.getByRole('list', { name: 'Account balances', exact: true })).toBeVisible();
            await expect(balancesCard.getByText('Available balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText('Reserved balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText('USD', { exact: true })).toHaveCount(1);

            await expect(totalsCard).toBeVisible();
            await expect(totalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
            await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText('USD', { exact: true })).toHaveCount(1);

            await balancesCard.click();

            // expanded balances card
            balancesCard = page.getByRole('button', { name: 'Show all account balances', exact: true, expanded: true });

            await expect(balancesCard).toBeVisible();
            await expect(balancesCard.getByRole('list', { name: 'Account balances', exact: true })).toBeVisible();
            await expect(balancesCard.getByText('Available balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText('Reserved balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText('USD', { exact: true })).toHaveCount(1);
            await expect(balancesCard.getByText('EUR', { exact: true })).toHaveCount(1);

            await totalsCard.click();

            // expanded totals card
            totalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: true });

            await expect(totalsCard).toBeVisible();
            await expect(totalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
            await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText('USD', { exact: true })).toHaveCount(1);
            await expect(totalsCard.getByText('EUR', { exact: true })).toHaveCount(1);
        });

        test('should render data grid', async ({ page }) => {
            await expect(page.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();

            await expect(page.getByRole('columnheader')).toHaveCount(6);
            await expect(page.getByRole('rowgroup')).toHaveCount(2);
            await expect(page.getByRole('row')).toHaveCount(10);
            await expect(page.getByRole('cell')).toHaveCount(60);
        });

        test('should render pagination controls', async ({ page }) => {
            const pageLimitSelector = page.getByRole('button', { name: 'Transactions per page', exact: true });
            const prevPageButton = page.getByRole('button', { name: 'Previous page', exact: true });
            const nextPageButton = page.getByRole('button', { name: 'Next page', exact: true });

            await expect(pageLimitSelector).toBeVisible();
            await expect(prevPageButton).toBeVisible();
            await expect(nextPageButton).toBeVisible();

            await expect(prevPageButton).toBeDisabled();
            await expect(nextPageButton).toBeEnabled();

            await expect(page.getByLabel('Transactions pagination').getByText('Showing ')).toBeVisible();
            await expect(pageLimitSelector.getByText('10', { exact: true })).toBeVisible();
        });
    });

    test.describe('Insights view: Rendering', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Insights');
        });

        test('should render segmented controls for switching views', async ({ page }) => {
            await expect(page.getByRole('radio', { name: 'Transactions', exact: true, checked: false })).toBeVisible();
            await expect(page.getByRole('radio', { name: 'Insights', exact: true, checked: true })).toBeVisible();
            await expect(page.getByRole('radio')).toHaveCount(2);
        });

        test('should render filter bar', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
        });

        test('should render period totals', async ({ page }) => {
            await expect(page.getByText('Period result', { exact: true })).toBeVisible();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(page.getByText('USD', { exact: true }).first()).toBeVisible();
        });
    });

    test.describe('Transactions export: With default filters', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await openExportPopover(page, analyticsEvents);
        });

        test('should render export popover', async ({ page }) => {
            const popover = page.locator('.adyen-pe-transactions-export__popover');

            await expect(popover.getByText('Applied filters:', { exact: true })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Account' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Date' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default')).toHaveCount(2);
            await expect(popover.locator('.adyen-pe-tag')).toHaveCount(2);

            await expect(popover.getByText('Columns', { exact: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'All 10 columns', exact: true, checked: false })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Date', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Payment method', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Transaction type', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Currency', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Net amount', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('checkbox', { name: 'Gross amount', exact: true, checked: true })).toBeVisible();

            await expect(popover.getByRole('checkbox')).toHaveCount(11);
            await expect(popover.getByRole('checkbox', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(6);

            await expect(popover.getByText('The download includes the top 100 entries.', { exact: true })).toBeVisible();
            await expect(popover.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
            await expect(popover.locator('.adyen-pe-alert')).toHaveCount(1);

            await expect(popover.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
            await expect(popover.getByRole('button', { name: 'Download', exact: true })).toBeVisible();
        });

        test('should close export popover when the "Export" button is clicked again', async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Export', exact: true }).click();
            await expect(page.locator('.adyen-pe-transactions-export__popover')).toBeHidden();
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
        });

        test('should close export popover when the "Cancel" button is clicked', async ({ page, analyticsEvents }) => {
            const popover = page.locator('.adyen-pe-transactions-export__popover');
            await popover.getByRole('button', { name: 'Cancel', exact: true }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
            await expect(popover).toBeHidden();
        });

        test('should close export popover when clicked outside', async ({ page, analyticsEvents }) => {
            await page.click('body', { position: { x: 0, y: 0 } });
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
            await expect(page.locator('.adyen-pe-transactions-export__popover')).toBeHidden();
        });

        test('should control all column switches with the master switch', async ({ page }) => {
            const popover = page.locator('.adyen-pe-transactions-export__popover');
            const masterSwitch = popover.getByRole('checkbox', { name: 'All 10 columns', exact: true });
            const masterSwitchLabel = popover.getByText('All 10 columns', { exact: true });

            await expect(masterSwitch).toBeChecked({ checked: false });
            await expect(popover.getByRole('checkbox', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(6);

            await masterSwitchLabel.click();

            await expect(masterSwitch).toBeChecked({ checked: true });
            await expect(popover.getByRole('checkbox', { checked: false })).toHaveCount(0);
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(11);

            await masterSwitchLabel.click();

            await expect(masterSwitch).toBeChecked({ checked: false });
            await expect(popover.getByRole('checkbox', { checked: false })).toHaveCount(11);
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(0);
        });

        test('should restore default column switches state when popover reopens', async ({ page, analyticsEvents }) => {
            const exportButton = page.getByRole('button', { name: 'Export', exact: true });
            const popover = page.locator('.adyen-pe-transactions-export__popover');

            // Check all the column switches by clicking the master switch
            await popover.getByText('All 10 columns', { exact: true }).click();

            // Click "Export" button twice, to close and reopen popover
            await exportButton.click();
            await exportButton.click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Cancelled export', sharedTransactionsListAnalyticsEventProperties],
                ['Clicked button', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Export' }],
            ]);

            await expect(popover.getByRole('checkbox', { name: 'All 10 columns', exact: true })).toBeChecked({ checked: false });
            await expect(popover.getByRole('checkbox', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(6);
        });

        test('should disable the "Download" button when all column switches are unchecked', async ({ page }) => {
            const popover = page.locator('.adyen-pe-transactions-export__popover');
            const masterSwitchLabel = popover.getByText('All 10 columns', { exact: true });
            const downloadButton = popover.getByRole('button', { name: 'Download', exact: true });

            await expect(downloadButton).toBeEnabled();

            // Check all the column switches by clicking the master switch
            await masterSwitchLabel.click();
            await expect(downloadButton).toBeEnabled();

            // Uncheck all the column switches by clicking the master switch again
            await masterSwitchLabel.click();
            await expect(downloadButton).toBeDisabled();
        });

        test('should download transactions with default columns', async ({ page, analyticsEvents }) => {
            await downloadTransactions(page, analyticsEvents, 'Default');
        });

        test('should download transactions with custom columns', async ({ page, analyticsEvents }) => {
            // Uncheck the default-selected "Currency" column and download
            const popover = page.locator('.adyen-pe-transactions-export__popover');
            await popover.getByText('Currency', { exact: true }).click();
            await expect(popover.getByRole('checkbox', { name: 'Currency', exact: true })).toBeChecked({ checked: false });
            await downloadTransactions(page, analyticsEvents, 'Custom');
        });

        test('should download transactions with all columns', async ({ page, analyticsEvents }) => {
            // Check all columns and download
            const popover = page.locator('.adyen-pe-transactions-export__popover');
            await popover.getByText('All 10 columns', { exact: true }).click();
            await expect(popover.getByRole('checkbox', { checked: true })).toHaveCount(11);
            await downloadTransactions(page, analyticsEvents, 'All');
        });
    });

    test.describe('Transactions export: With modified filters', () => {
        test('should show all applied filters', async ({ page, analyticsEvents }) => {
            await selectSingleCategoryFromMultiSelectFilter(page, analyticsEvents, 'Payment');
            await selectSingleCurrencyFromMultiSelectFilter(page, analyticsEvents, 'USD');
            await setExactPspReference(page, analyticsEvents, 'PSP0000000000056');
            await openExportPopover(page, analyticsEvents);

            const popover = page.locator('.adyen-pe-transactions-export__popover');

            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Account' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Date' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Transaction type' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'Currency' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default', { hasText: 'PSP reference' })).toBeVisible();
            await expect(popover.locator('.adyen-pe-tag--default')).toHaveCount(5);
            await expect(popover.locator('.adyen-pe-tag')).toHaveCount(5);
        });

        test('should disable "Export" button if applied filters match no transactions', async ({ page, analyticsEvents }) => {
            await setExactPspReference(page, analyticsEvents, 'PSP1234567890123');
            await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeDisabled();
            await expect(page.getByRole('row')).toHaveCount(0);
            await expect(page.getByRole('cell')).toHaveCount(0);
        });
    });
});
