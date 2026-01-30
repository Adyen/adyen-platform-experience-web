import {
    applyPspReferenceFilter,
    downloadTransactions,
    extractTodayDateFromDatePicker,
    goToView,
    openExportPopover,
    openTransactionDetailsModal,
    resetPspReferenceFilter,
    selectFirstUnselectedBalanceAccount,
    selectSingleCategoryFromMultiSelectFilter,
    selectSingleCurrencyFromMultiSelectFilter,
    setExactPspReference,
} from './shared/utils';
import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, getTranslatedKey, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-overview--default';
const NOW = Date.now();

test.describe('Default', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('View: Transactions', () => {
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
            const dataGrid = page.getByRole('table');

            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();

            await expect(dataGrid.getByRole('columnheader')).toHaveCount(6);
            await expect(dataGrid.getByRole('rowgroup')).toHaveCount(2);
            await expect(dataGrid.getByRole('row')).toHaveCount(10);
            await expect(dataGrid.getByRole('cell')).toHaveCount(60);
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

        test('should render transaction details modal for clicked row', async ({ page, analyticsEvents }) => {
            await openTransactionDetailsModal(page, analyticsEvents, 0 /* first row transaction */);

            const detailsModal = page.getByRole('dialog');
            await detailsModal.getByRole('tab', { name: 'Details', exact: true }).click();

            const referenceID = detailsModal.getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`).locator('dd');
            await expect(referenceID).toHaveText('B78I76Y77072H127');
        });
    });

    test.describe('View: Insights', () => {
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

        test('should return to transactions view when "Transactions" button is clicked', async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Transactions');
            await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible(); // Transactions export button
        });
    });

    test.describe('Filter: Balance account', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'Balance account', exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render balance account options', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog.getByRole('option', { selected: true })).toHaveCount(1);
            await expect(filterDialog.getByRole('option', { selected: false })).toHaveCount(2);
        });

        test('should select another balance account option (Transactions View)', async ({ page, analyticsEvents }) => {
            await selectFirstUnselectedBalanceAccount(page, analyticsEvents, 'Transactions');
        });

        test('should select another balance account option (Insights View)', async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Insights');
            await page.getByRole('button', { name: 'Balance account', exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            await selectFirstUnselectedBalanceAccount(page, analyticsEvents, 'Insights');
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.getByRole('button', { name: 'Balance account', exact: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.click('body', { position: { x: 0, y: 0 } });
            await expect(filterDialog).toBeHidden();
        });
    });

    test.describe('Filter: Date range', () => {
        const sharedModifiedDateFilterEventProperties = {
            ...sharedTransactionsListAnalyticsEventProperties,
            label: 'Date filter',
            actionType: 'update',
        };

        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'Date range', exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render datepicker', async ({ page }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const dateRangeOptionsDialog = page.getByRole('dialog').nth(1);
            const dateRangeSelectorButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true });

            await dateRangeSelectorButton.click();

            const customDateRangeOption = dateRangeOptionsDialog.getByRole('option', { name: 'Custom', exact: true });
            const defaultDateRangeOption = dateRangeOptionsDialog.getByRole('option', { selected: true });
            const dateRange = 'Year to date';

            await expect(customDateRangeOption).toBeHidden();
            await expect(defaultDateRangeOption).toHaveText('Last 180 days');
            await expect(defaultDateRangeOption).toHaveCount(1);

            await dateRangeOptionsDialog.getByRole('option', { name: dateRange, exact: true }).click();
            await expect(dateRangeSelectorButton).toHaveText(dateRange);
            await expect(dateRangeOptionsDialog).toBeHidden();

            await datePicker.locator(`[data-today='1']`).click();
            await expect(dateRangeSelectorButton).toHaveText('Custom');
            await dateRangeSelectorButton.click();

            await expect(customDateRangeOption).toBeVisible();
            await expect(defaultDateRangeOption).toHaveText('Custom');
            await expect(defaultDateRangeOption).toHaveCount(1);
        });

        test('should select another date range option (Transactions View)', async ({ page, analyticsEvents }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const dateRangeOptionsDialog = page.getByRole('dialog').nth(1);
            const filterButton = page.getByRole('button', { name: 'Date range', exact: true });
            const dateRangeSelectorButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true });

            const dateRange = 'Year to date';

            await dateRangeSelectorButton.click();
            await dateRangeOptionsDialog.getByRole('option', { name: dateRange, exact: true }).click();
            await expect(dateRangeSelectorButton).toHaveText(dateRange);
            await expect(dateRangeOptionsDialog).toBeHidden();

            await datePicker.getByRole('button', { name: 'Apply', exact: true }).click();
            await expect(filterButton).toHaveText(dateRange);
            await expect(datePicker).toBeHidden();

            await expectAnalyticsEvents(analyticsEvents, [['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: dateRange }]]);
        });

        test('should select custom date range (Transactions View)', async ({ page, analyticsEvents }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const filterButton = page.getByRole('button', { name: 'Date range', exact: true });
            const dateRangeSelectorButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true });
            const today = await extractTodayDateFromDatePicker(datePicker, NOW);

            await datePicker.locator(`[data-today='1']`).click();
            await expect(dateRangeSelectorButton).toHaveText('Custom');

            await datePicker.getByRole('button', { name: 'Apply', exact: true }).click();
            await expect(filterButton).toHaveText(today.formattedDate);
            await expect(datePicker).toBeHidden();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${today.timestamps}` }],
            ]);
        });

        test('should reset date range (Transactions View)', async ({ page, analyticsEvents }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const filterButton = page.getByRole('button', { name: 'Date range', exact: true });
            const dateRangeSelectorButton = datePicker.getByRole('button', { name: 'Preset range select', exact: true });
            const today = await extractTodayDateFromDatePicker(datePicker, NOW);

            await datePicker.locator(`[data-today='1']`).click();
            await expect(dateRangeSelectorButton).toHaveText('Custom');

            await datePicker.getByRole('button', { name: 'Apply', exact: true }).click();
            await expect(filterButton).toHaveText(today.formattedDate);
            await expect(datePicker).toBeHidden();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${today.timestamps}` }],
            ]);

            // reopen and reset datepicker
            await filterButton.click();
            await expect(datePicker).toBeVisible();

            await datePicker.getByRole('button', { name: 'Reset', exact: true }).click();
            await expect(filterButton).toHaveText('Last 180 days');
            await expect(datePicker).toBeHidden();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: 'Last 180 days' }],
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, actionType: 'reset' }],
            ]);
        });

        test('should close datepicker when the filter button is clicked again', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.getByRole('button', { name: 'Date range', exact: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close datepicker when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.click('body', { position: { x: 0, y: 0 } });
            await expect(filterDialog).toBeHidden();
        });
    });

    test.describe('Filter: PSP reference', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render correctly without any input', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            const inputField = filterDialog.getByLabel('PSP reference', { exact: true });

            await expect(inputField).toBeEnabled();
            await expect(inputField).toHaveValue('');
            await expect(filterDialog.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should render correctly with previous valid input when filter dialog is reopened', async ({ page, analyticsEvents }) => {
            const filterDialog = page.getByRole('dialog');
            const inputField = filterDialog.getByLabel('PSP reference', { exact: true });
            const pspReference = 'PSP0000000000056';

            await inputField.fill(pspReference);

            await expect(inputField).toHaveValue(pspReference);
            await expect(filterDialog.getByRole('button', { name: 'Reset', exact: true })).toBeEnabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeEnabled();

            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(filterDialog).toBeVisible();

            // maintains input state
            await expect(inputField).toHaveValue(pspReference);
            await expect(filterDialog.getByRole('button', { name: 'Reset', exact: true })).toBeEnabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should reset previous valid input', async ({ page, analyticsEvents }) => {
            const filterDialog = page.getByRole('dialog');
            await filterDialog.getByLabel('PSP reference', { exact: true }).fill('PSP0000000000056');
            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog and reset
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(filterDialog).toBeVisible();
            await resetPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(filterDialog).toBeVisible();

            await expect(filterDialog.getByLabel('PSP reference', { exact: true })).toHaveValue('');
            await expect(filterDialog.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should only accept valid length long input (without previous input)', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            const errorMessage = filterDialog.getByText('Should be 16 characters long', { exact: true });
            const inputField = filterDialog.getByLabel('PSP reference', { exact: true });
            const applyButton = filterDialog.getByRole('button', { name: 'Apply', exact: true });
            const resetButton = filterDialog.getByRole('button', { name: 'Reset', exact: true });

            // with invalid characters (sill be stripped)
            await inputField.fill('#eru-y458');
            await expect(inputField).toHaveValue('ERUY458');
            await expect(errorMessage).toBeVisible();
            await expect(applyButton).toBeDisabled();
            await expect(resetButton).toBeDisabled();

            // empty input
            await inputField.fill('');
            await expect(inputField).toHaveValue('');
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeDisabled();
            await expect(resetButton).toBeDisabled();

            // short input
            await inputField.fill('123456');
            await expect(inputField).toHaveValue('123456');
            await expect(errorMessage).toBeVisible();
            await expect(applyButton).toBeDisabled();
            await expect(resetButton).toBeDisabled();

            // too long input (will be truncated)
            await inputField.fill('PSP0000000000999000');
            await expect(inputField).toHaveValue('PSP0000000000999');
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeEnabled();
            await expect(resetButton).toBeEnabled();

            // lowercase characters
            await inputField.fill('psp0000000000099');
            await expect(inputField).toHaveValue('PSP0000000000099');
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeEnabled();
            await expect(resetButton).toBeEnabled();
        });

        test('should only accept valid length long input (with previous input)', async ({ page, analyticsEvents }) => {
            const filterDialog = page.getByRole('dialog');
            const errorMessage = filterDialog.getByText('Should be 16 characters long', { exact: true });
            const inputField = filterDialog.getByLabel('PSP reference', { exact: true });
            const applyButton = filterDialog.getByRole('button', { name: 'Apply', exact: true });
            const resetButton = filterDialog.getByRole('button', { name: 'Reset', exact: true });

            const pspReferenceWithoutLastCharacter = 'PSP000000000005';
            const pspReference = `${pspReferenceWithoutLastCharacter}6`;

            await inputField.fill(pspReference);
            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(filterDialog).toBeVisible();

            // backspace last character
            await inputField.fill(pspReferenceWithoutLastCharacter);
            await expect(inputField).toHaveValue(pspReferenceWithoutLastCharacter);
            await expect(errorMessage).toBeVisible();
            await expect(applyButton).toBeDisabled();
            await expect(resetButton).toBeEnabled();

            // restore last character
            await inputField.fill(pspReference);
            await expect(inputField).toHaveValue(pspReference);
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeDisabled();
            await expect(resetButton).toBeEnabled();

            // replace last character
            await inputField.fill(`${pspReferenceWithoutLastCharacter}9`);
            await expect(inputField).toHaveValue(`${pspReferenceWithoutLastCharacter}9`);
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeEnabled();
            await expect(resetButton).toBeEnabled();

            // empty input
            await inputField.fill('');
            await expect(inputField).toHaveValue('');
            await expect(errorMessage).toBeHidden();
            await expect(applyButton).toBeEnabled();
            await expect(resetButton).toBeDisabled();
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.click('body', { position: { x: 0, y: 0 } });
            await expect(filterDialog).toBeHidden();
        });
    });

    test.describe('Export: With default filters', () => {
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

    test.describe('Export: With modified filters', () => {
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
