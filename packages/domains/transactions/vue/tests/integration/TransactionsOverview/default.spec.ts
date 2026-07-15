import {
    applyPspReferenceFilter,
    downloadTransactions,
    openExportPopover,
    openTransactionDetailsModal,
    resetPspReferenceFilter,
    selectSingleCategoryFromMultiSelectFilter,
    selectSingleCurrencyFromMultiSelectFilter,
    setExactPspReference,
} from './shared/utils';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { testBalanceAccountFilter, testDateRangeFilter } from '../../../../fixtures/integration/filters';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
import { goToView } from '../../../../fixtures/integration/utils';
import { sleep } from '@integration-components/testing/fixtures/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--default';

const getExportDialog = (page: Page) => {
    return page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Download', exact: true }) });
};

const getPSPReferenceInput = (filterDialog: Locator) => {
    return filterDialog.getByRole('textbox' /*, { name: 'PSP reference', exact: true }*/);
};

test.describe('Default', () => {
    const NOW = Date.now();

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
            const toolbar = page.getByRole('toolbar');
            await expect(toolbar.getByRole('button', { name: /^Balance account/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Type/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Currency/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^PSP reference/, disabled: false })).toBeVisible();
        });

        test('should render transactions export button', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Export', exact: true, disabled: false, expanded: false })).toBeVisible();
        });

        test('should render transaction totals and account balances', async ({ page }) => {
            // [TODO]: Fix accessible names for the totals and balances expandable cards
            let balancesCardButton = page.getByRole('button', { name: /^Available balance/i, expanded: false });
            let totalsCardButton = page.getByRole('button', { name: /^Total incoming/i, expanded: false });

            let balancesCard = balancesCardButton.locator('..');
            let totalsCard = totalsCardButton.locator('..');

            await expect(balancesCard).toBeVisible();
            await expect(balancesCardButton).toBeVisible();
            await expect(balancesCard.getByText('Available balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText('Reserved balance', { exact: true })).toBeVisible();
            await expect(balancesCard.getByText(/USD/)).toHaveCount(2);

            await expect(totalsCard).toBeVisible();
            await expect(totalsCardButton).toBeVisible();
            await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(totalsCard.getByText(/USD/)).toHaveCount(2);

            await balancesCardButton.click();

            // expanded balances card
            balancesCardButton = page.getByRole('button', { name: /^Available balance/i, expanded: true });
            balancesCard = balancesCardButton.locator('..');

            await expect(balancesCard).toBeVisible();
            await expect(balancesCardButton).toBeVisible();
            await expect(balancesCard.getByText('Available balance', { exact: true }).first()).toBeVisible();
            await expect(balancesCard.getByText('Reserved balance', { exact: true }).first()).toBeVisible();
            await expect(balancesCard.getByText(/USD/)).toHaveCount(2);
            await expect(balancesCard.getByText(/EUR/)).toHaveCount(2);

            await totalsCardButton.click();

            // expanded totals card
            totalsCardButton = page.getByRole('button', { name: /^Total incoming/i, expanded: true });
            totalsCard = totalsCardButton.locator('..');

            await expect(totalsCard).toBeVisible();
            await expect(totalsCardButton).toBeVisible();
            await expect(totalsCard.getByText('Total incoming', { exact: true }).first()).toBeVisible();
            await expect(totalsCard.getByText('Total outgoing', { exact: true }).first()).toBeVisible();
            await expect(totalsCard.getByText(/USD/)).toHaveCount(2);
            await expect(totalsCard.getByText(/EUR/)).toHaveCount(2);
        });

        test('should render data grid', async ({ page }) => {
            const dataGrid = page.getByRole('grid');

            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();

            await expect(dataGrid.getByRole('columnheader')).toHaveCount(6);
            await expect(dataGrid.getByRole('rowgroup')).toHaveCount(2);
            await expect(dataGrid.getByRole('rowgroup').nth(1).getByRole('row')).toHaveCount(10);
            await expect(dataGrid.getByRole('gridcell')).toHaveCount(60);
        });

        test('should render pagination controls', async ({ page }) => {
            const pagination = page.getByRole('navigation', { name: /Pagination/i });
            const pageLimitSelect = pagination.getByRole('combobox', { name: /Items/i, disabled: false, expanded: false });
            const prevPageButton = pagination.getByRole('button', { name: /Previous page/i, disabled: true });
            const nextPageButton = pagination.getByRole('button', { name: /Next page/i, disabled: false });

            await expect(pageLimitSelect).toBeVisible();
            await expect(prevPageButton).toBeVisible();
            await expect(nextPageButton).toBeVisible();

            await expect(pageLimitSelect).toBeVisible();
            await expect(pageLimitSelect).toHaveText('10');
            await expect(pagination.getByText('items')).toBeVisible();
        });

        test('should render transaction details modal for clicked row', async ({ page, analyticsEvents }) => {
            await openTransactionDetailsModal(page, analyticsEvents, 0 /* first row transaction */);

            const detailsModal = page.getByRole('dialog');
            await detailsModal.getByRole('tab', { name: 'Details', exact: true }).click();
            await expect(page.getByText('B78I76Y77072H127', { exact: true }).first()).toBeVisible();
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
            const toolbar = page.getByRole('toolbar');
            await expect(toolbar.getByRole('button', { name: /^Balance account/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Currency/, disabled: false })).toBeVisible();
        });

        test('should render period totals', async ({ page }) => {
            await expect(page.getByText('Period result', { exact: true })).toBeVisible();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(page.getByText('USD', { exact: true }).first()).toBeVisible();
        });

        test('should return to transactions view when "Transactions" button is clicked', async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Transactions');
            await expect(page.getByRole('button', { name: 'Export', exact: true, disabled: false, expanded: false })).toBeVisible(); // Transactions export button
        });
    });

    test.describe('Filter: PSP reference', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: /^PSP reference/ }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render correctly without any input', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            const inputField = getPSPReferenceInput(filterDialog);

            await expect(inputField).toBeEnabled();
            await expect(inputField).toHaveValue('');
            await expect(filterDialog.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should render correctly with previous valid input when filter dialog is reopened', async ({ page, analyticsEvents }) => {
            // [TODO]: Address multiple unrelated "Modified filter" events being triggered for untouched filters (Bento only)
            test.fixme(true, 'Multiple unrelated "Modified filter" events being triggered for untouched filters');

            const filterDialog = page.getByRole('dialog');
            const inputField = getPSPReferenceInput(filterDialog);
            const pspReference = 'PSP0000000000056';

            await inputField.fill(pspReference);

            await expect(inputField).toHaveValue(pspReference);
            await expect(filterDialog.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeEnabled();

            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: /^PSP reference/ }).click();
            await expect(filterDialog).toBeVisible();

            // maintains input state
            await expect(inputField).toHaveValue(pspReference);
            await expect(filterDialog.getByRole('button', { name: 'Clear', exact: true })).toBeEnabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should reset previous valid input', async ({ page, analyticsEvents }) => {
            // [TODO]: Address multiple unrelated "Modified filter" events being triggered for untouched filters (Bento only)
            test.fixme(true, 'Multiple unrelated "Modified filter" events being triggered for untouched filters');

            const filterDialog = page.getByRole('dialog');
            await getPSPReferenceInput(filterDialog).fill('PSP0000000000056');
            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog and reset
            await page.getByRole('button', { name: /^PSP reference/ }).click();
            await expect(filterDialog).toBeVisible();
            await resetPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: /^PSP reference/ }).click();
            await expect(filterDialog).toBeVisible();

            await expect(getPSPReferenceInput(filterDialog)).toHaveValue('');
            await expect(filterDialog.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
            await expect(filterDialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        });

        test('should only accept valid length long input (without previous input)', async ({ page }) => {
            // [TODO]: Address input rules for PSP reference filter not correctly applied
            test.fixme(true, 'Input rules for PSP reference filter not correctly applied');

            const filterDialog = page.getByRole('dialog');
            const errorMessage = filterDialog.getByText('Should be 16 characters long', { exact: true });
            const inputField = getPSPReferenceInput(filterDialog);
            const applyButton = filterDialog.getByRole('button', { name: 'Apply', exact: true });
            const resetButton = filterDialog.getByRole('button', { name: 'Clear', exact: true });

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
            // [TODO]: Address input rules for PSP reference filter not correctly applied
            test.fixme(true, 'Input rules for PSP reference filter not correctly applied');

            const filterDialog = page.getByRole('dialog');
            const errorMessage = filterDialog.getByText('Should be 16 characters long', { exact: true });
            const inputField = getPSPReferenceInput(filterDialog);
            const applyButton = filterDialog.getByRole('button', { name: 'Apply', exact: true });
            const resetButton = filterDialog.getByRole('button', { name: 'Clear', exact: true });

            const pspReferenceWithoutLastCharacter = 'PSP000000000005';
            const pspReference = `${pspReferenceWithoutLastCharacter}6`;

            await inputField.fill(pspReference);
            await applyPspReferenceFilter(page, analyticsEvents);

            // re-open filter dialog
            await page.getByRole('button', { name: /^PSP reference/ }).click();
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
            await page.getByRole('button', { name: /^PSP reference/ }).click();
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
            const popover = getExportDialog(page);
            const filters = popover.getByText(/^Applied filters:/).locator('..');

            await expect(filters).toBeVisible();
            await expect(filters.getByText('Account', { exact: true })).toBeVisible();
            await expect(filters.getByText('Date', { exact: true })).toBeVisible();

            await expect(popover.getByText('Columns', { exact: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'All 10 columns', exact: true, checked: false })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Date', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Payment method', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Transaction type', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Currency', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Net amount', exact: true, checked: true })).toBeVisible();
            await expect(popover.getByRole('switch', { name: 'Gross amount', exact: true, checked: true })).toBeVisible();

            await expect(popover.getByRole('switch')).toHaveCount(11);
            await expect(popover.getByRole('switch', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(6);

            await expect(popover.getByText('The download includes the top 100 entries.', { exact: true })).toBeVisible();
            await expect(popover.getByRole('status')).toHaveCount(1);

            await expect(popover.getByRole('button', { name: 'Cancel', exact: true, disabled: false })).toBeVisible();
            await expect(popover.getByRole('button', { name: 'Download', exact: true, disabled: false })).toBeVisible();
        });

        test('should close export popover when the "Export" button is clicked again', async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Export', exact: true, disabled: false, expanded: true }).click();
            await expect(getExportDialog(page)).toBeHidden();
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
        });

        test('should close export popover when the "Cancel" button is clicked', async ({ page, analyticsEvents }) => {
            const popover = getExportDialog(page);
            await popover.getByRole('button', { name: 'Cancel', exact: true, disabled: false }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
            await expect(popover).toBeHidden();
        });

        test('should close export popover when clicked outside', async ({ page, analyticsEvents }) => {
            await page.click('body', { position: { x: 0, y: 0 } });
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled export', sharedTransactionsListAnalyticsEventProperties]]);
            await expect(getExportDialog(page)).toBeHidden();
        });

        test('should control all column switches with the master switch', async ({ page }) => {
            const popover = getExportDialog(page);
            const masterSwitch = popover.getByRole('switch', { name: 'All 10 columns', exact: true });
            const masterSwitchLabel = popover.getByText('All 10 columns', { exact: true });

            await expect(masterSwitch).toBeChecked({ checked: false });
            await expect(popover.getByRole('switch', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(6);

            await masterSwitchLabel.click();

            await expect(masterSwitch).toBeChecked({ checked: true });
            await expect(popover.getByRole('switch', { checked: false })).toHaveCount(0);
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(11);

            await masterSwitchLabel.click();

            await expect(masterSwitch).toBeChecked({ checked: false });
            await expect(popover.getByRole('switch', { checked: false })).toHaveCount(11);
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(0);
        });

        test('should restore default column switches state when popover reopens', async ({ page, analyticsEvents }) => {
            const exportButton = page.getByRole('button', { name: 'Export', exact: true, disabled: false });
            const popover = getExportDialog(page);

            // Check all the column switches by clicking the master switch
            await popover.getByText('All 10 columns', { exact: true }).click();

            // Click "Export" button twice, to close and reopen popover
            // A short delay is introduced between clicks to escape an inconsistent behavior resulting in
            // non-deterministic state when the export popover is toggled very quickly (like in this test).
            // [TODO]: Investigate and address cause of inconsistent behavior when export popover is toggled quickly
            await exportButton.click();
            await sleep(500);
            await exportButton.click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Cancelled export', sharedTransactionsListAnalyticsEventProperties],
                ['Clicked button', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Export' }],
            ]);

            await expect(popover.getByRole('switch', { name: 'All 10 columns', exact: true })).toBeChecked({ checked: false });
            await expect(popover.getByRole('switch', { checked: false })).toHaveCount(5);
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(6);
        });

        test('should disable the "Download" button when all column switches are unchecked', async ({ page }) => {
            const popover = getExportDialog(page);
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
            const popover = getExportDialog(page);
            await popover.getByText('Currency', { exact: true }).click();
            await expect(popover.getByRole('switch', { name: 'Currency', exact: true })).toBeChecked({ checked: false });
            await downloadTransactions(page, analyticsEvents, 'Custom');
        });

        test('should download transactions with all columns', async ({ page, analyticsEvents }) => {
            // Check all columns and download
            const popover = getExportDialog(page);
            await popover.getByText('All 10 columns', { exact: true }).click();
            await expect(popover.getByRole('switch', { checked: true })).toHaveCount(11);
            await downloadTransactions(page, analyticsEvents, 'All');
        });
    });

    test.describe('Export: With modified filters', () => {
        test('should show all applied filters', async ({ page, analyticsEvents }) => {
            // [TODO]: Address multiple unrelated "Modified filter" events being triggered for untouched filters (Bento only)
            test.fixme(true, 'Multiple unrelated "Modified filter" events being triggered for untouched filters');

            await selectSingleCategoryFromMultiSelectFilter(page, analyticsEvents, 'Payment');
            await selectSingleCurrencyFromMultiSelectFilter(page, analyticsEvents, 'USD');
            await setExactPspReference(page, analyticsEvents, 'PSP0000000000056');
            await openExportPopover(page, analyticsEvents);

            const filters = getExportDialog(page)
                .getByText(/^Applied filters:/)
                .locator('..');

            await Promise.all([
                expect(filters.getByText('Account', { exact: true })).toBeVisible(),
                expect(filters.getByText('Date', { exact: true })).toBeVisible(),
                expect(filters.getByText('Transaction type', { exact: true })).toBeVisible(),
                expect(filters.getByText('Currency', { exact: true })).toBeVisible(),
                expect(filters.getByText('PSP reference', { exact: true })).toBeVisible(),
            ]);
        });

        test('should disable "Export" button if applied filters match no transactions', async ({ page, analyticsEvents }) => {
            // [TODO]: Address multiple unrelated "Modified filter" events being triggered for untouched filters (Bento only)
            test.fixme(true, 'Multiple unrelated "Modified filter" events being triggered for untouched filters');

            await setExactPspReference(page, analyticsEvents, 'PSP1234567890123');
            await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeDisabled();
            await expect(page.getByRole('row')).toHaveCount(0);
            await expect(page.getByRole('cell')).toHaveCount(0);
        });
    });
});

test.describe('Filters', () => {
    // Use specific date to evade Bento's preset resolution/auto-selection for current day selection
    const now = new Date('2024-07-17T00:00:00.000Z').getTime();
    const variant = 'Bento';

    test.beforeEach(async ({ page, analyticsEvents }) => {
        await page.clock.setFixedTime(now);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    testBalanceAccountFilter({ variant });
    testDateRangeFilter({ variant, now });
});
