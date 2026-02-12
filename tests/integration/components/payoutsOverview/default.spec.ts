import { test, expect } from '@playwright/test';
import { openPayoutDetailsModal } from './shared/utils';
import { clickOutsideDialog, goToStory, selectFirstUnselectedBalanceAccount } from '../../../utils/utils';
import { resetDatePicker, selectDateRangeResetFromDatePicker, selectTodayDateFromDatePicker } from '../../../utils/datePicker';

const STORY_ID = 'mocked-payouts-payouts-overview--default';
const NOW = Date.now();

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Render', () => {
        test('should render transactions overview', async ({ page }) => {
            const information = 'Payout information is generated each day at midnight, UTC time.';
            const filters = page.getByRole('group', { name: 'Payouts filters', exact: true });
            const table = page.getByRole('table');

            const pagination = page.getByRole('group', { name: 'Payouts pagination', exact: true });
            const limitSelect = pagination.getByRole('button', { name: 'Payouts per page', exact: true, disabled: false, expanded: false });

            await Promise.all([
                // (1) Information
                expect(page.getByText(information, { exact: true })).toBeVisible(),

                // (2) Filter controls
                expect(filters.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: false })).toBeVisible(),
                expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible(),

                // (3) Table
                expect(table.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible(),
                expect(table.getByRole('columnheader', { name: 'Funds captured (€)', exact: true })).toBeVisible(),
                expect(table.getByRole('columnheader', { name: 'Adjustments (€)', exact: true })).toBeVisible(),
                expect(table.getByRole('columnheader', { name: 'Net payout (€)', exact: true })).toBeVisible(),

                expect(table.getByRole('columnheader')).toHaveCount(4),
                expect(table.getByRole('rowgroup')).toHaveCount(2),
                expect(table.getByRole('row')).toHaveCount(9),
                expect(table.getByRole('cell')).toHaveCount(36),

                // (4) Pagination controls
                expect(pagination.getByText('Showing ')).toBeVisible(),
                expect(limitSelect).toHaveText('10'),
                expect(limitSelect).toBeVisible(),

                expect(pagination.getByRole('button', { name: 'Previous page', exact: true, disabled: true })).toBeVisible(),
                expect(pagination.getByRole('button', { name: 'Next page', exact: true, disabled: true })).toBeVisible(),
            ]);
        });
    });

    test.describe('Details modal', () => {
        test.beforeEach(async ({ page }) => {
            await openPayoutDetailsModal(page, 0);
        });

        test('should render payout details modal and close the modal when dismissed', async ({ page }) => {
            const detailsModal = page.getByRole('dialog');
            await detailsModal.getByRole('button', { name: 'Close modal', exact: true, disabled: false }).click();
            await expect(detailsModal).toBeHidden();
        });

        test('should render payout details modal and close the modal when clicked outside', async ({ page }) => {
            const detailsModal = page.getByRole('dialog');
            await clickOutsideDialog(detailsModal);
        });
    });

    test.describe('Filter: Balance account', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: false }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render balance account options', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            const selectedOption = filterDialog.getByRole('option', { selected: true });
            const unselectedOptions = filterDialog.getByRole('option', { selected: false, disabled: false });

            await Promise.all([
                expect(selectedOption).toHaveText(/S\. Hopper - Main Account/),
                expect(selectedOption).toHaveText(/BA32272223222B5CTDQPM6W2H/),
                expect(selectedOption).toHaveCount(1),
                expect(unselectedOptions).toHaveCount(2),
            ]);
        });

        test('should select another balance account option', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await selectFirstUnselectedBalanceAccount(filterDialog);
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await clickOutsideDialog(filterDialog);
        });
    });

    test.describe('Filter: Date range', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });

        test('should render datepicker', async ({ page }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const dateRangePresetSelectDialog = page.getByRole('dialog').nth(1);
            const dateRangePresetSelectButton = datePicker.getByRole('button', {
                name: 'Preset range select',
                exact: true,
                disabled: false,
                expanded: false,
            });

            const customDateRangeOption = dateRangePresetSelectDialog.getByRole('option', { name: 'Custom', exact: true });
            const selectedDateRangeOption = dateRangePresetSelectDialog.getByRole('option', { selected: true });
            const todayDate = datePicker.locator(`[data-today='1'][aria-selected='true']`);

            const nextDateRangePreset = 'Year to date';

            await Promise.all([
                // (1) Date preset select
                expect(dateRangePresetSelectDialog).toBeHidden(),
                expect(dateRangePresetSelectButton).toBeVisible(),
                expect(dateRangePresetSelectButton).toHaveText('Last 30 days'),

                // (2) Calendar
                expect(todayDate).toBeVisible(),

                // (3) Timezone information
                expect(datePicker.getByText('Timezone is set on: GMT')).toBeVisible(),

                // (4) Apply and Reset button
                expect(datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: true })).toBeVisible(),
                expect(datePicker.getByRole('button', { name: 'Reset', exact: true, disabled: false })).toBeVisible(),
            ]);

            // Open date range preset select dialog
            await dateRangePresetSelectButton.click();

            await Promise.all([
                // Date range preset select dialog expanded
                expect(dateRangePresetSelectDialog).toBeVisible(),
                expect(customDateRangeOption).toBeHidden(),
                expect(selectedDateRangeOption).toBeVisible(),
                expect(selectedDateRangeOption).toHaveText('Last 30 days'),
            ]);

            // Select another date range option
            await dateRangePresetSelectDialog.getByRole('option', { name: nextDateRangePreset, exact: true }).click();

            await Promise.all([
                // Date range preset select dialog collapsed
                expect(dateRangePresetSelectDialog).toBeHidden(),
                expect(dateRangePresetSelectButton).toHaveText(nextDateRangePreset),
                expect(datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false })).toBeVisible(),
                expect(datePicker.getByRole('button', { name: 'Reset', exact: true, disabled: false })).toBeVisible(),
            ]);

            // Open date range preset select dialog (again)
            await dateRangePresetSelectButton.click();

            await Promise.all([
                // Date range preset select dialog expanded
                expect(dateRangePresetSelectDialog).toBeVisible(),
                expect(customDateRangeOption).toBeHidden(),
                expect(selectedDateRangeOption).toBeVisible(),
                expect(selectedDateRangeOption).toHaveText(nextDateRangePreset),
            ]);

            // Collapse date range preset select dialog
            await datePicker.getByRole('button', { name: 'Preset range select', exact: true, disabled: false, expanded: true }).click();

            // Select today's date from the calendar (custom selection)
            await todayDate.click();

            await Promise.all([
                // Date range preset select dialog collapsed
                expect(dateRangePresetSelectDialog).toBeHidden(),
                expect(dateRangePresetSelectButton).toHaveText('Custom'),
                expect(datePicker.getByRole('button', { name: 'Apply', exact: true, disabled: false })).toBeVisible(),
                expect(datePicker.getByRole('button', { name: 'Reset', exact: true, disabled: false })).toBeVisible(),
            ]);

            // Open date range preset select dialog (again)
            await dateRangePresetSelectButton.click();

            await Promise.all([
                // Date range preset select dialog expanded
                expect(dateRangePresetSelectDialog).toBeVisible(),
                expect(customDateRangeOption).toBeVisible(),
                expect(selectedDateRangeOption).toBeVisible(),
                expect(selectedDateRangeOption).toHaveText('Custom'),
            ]);
        });

        test('should select another date range option', async ({ page }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            await selectDateRangeResetFromDatePicker(datePicker, { selection: 'Year to date' });
        });

        test('should select custom date range', async ({ page }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            await selectTodayDateFromDatePicker(datePicker);
        });

        test('should reset date range', async ({ page }) => {
            const datePicker = page.getByRole('dialog').nth(0);

            // Select today's date from the calendar
            await selectTodayDateFromDatePicker(datePicker);

            // Reopen datepicker and reset date range selection
            await page.getByRole('button', { name: 'Date range', exact: true, expanded: false }).click();
            await resetDatePicker(datePicker, { defaultSelection: 'Last 30 days' });
        });

        test('should close datepicker when the filter button is clicked again', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await expect(filterDialog).toBeVisible();
            await page.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close datepicker when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await clickOutsideDialog(filterDialog);
        });
    });
});
