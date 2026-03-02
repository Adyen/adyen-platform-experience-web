import { test, expect } from '../../../fixtures/analytics/events';
import { sharedAnalyticsEventProperties } from './shared/constants';
import { resetDatePicker, selectDateRangeResetFromDatePicker, selectTodayDateFromDatePicker } from '../../../utils/datePicker';
import { clickOutsideDialog, expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { extractTodayDateFromDatePicker } from '../transactionsOverview/shared/utils';

const STORY_ID = 'mocked-transactions-transactions-insights--default';
const NOW = Date.now();

test.describe('Default', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test.describe('Render', () => {
        test('should render transactions insights', async ({ page }) => {
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });

            await Promise.all([
                // (1) Filter controls
                expect(filters.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: false })).toBeVisible(),
                expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible(),
                expect(filters.getByRole('button', { name: 'Currency', exact: true, disabled: false, expanded: false })).toBeVisible(),

                // (2) Period totals
                expect(page.getByText('Period result', { exact: true })).toBeVisible(),
                expect(page.getByText('Total incoming', { exact: true })).toBeVisible(),
                expect(page.getByText('Total outgoing', { exact: true })).toBeVisible(),
                expect(page.getByText('USD', { exact: true }).first()).toBeVisible(),
            ]);
        });
    });

    test.describe('Filter: Balance account', () => {
        test.beforeEach(async ({ page }) => {
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
            await filters.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: false }).click();
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

        test('should select another balance account option', async ({ page, analyticsEvents }) => {
            const filterDialog = page.getByRole('dialog');
            const firstUnselectedOption = filterDialog.getByRole('option', { selected: false }).nth(0);
            const balanceAccountId = await firstUnselectedOption.locator('.adyen-pe-balance-account-selector__account-id').textContent();

            const modifiedFilterEventProperties = {
                ...sharedAnalyticsEventProperties,
                label: 'Balance account filter',
                value: balanceAccountId,
                actionType: 'update',
            } as const;

            await firstUnselectedOption.click();
            await expect(filterDialog).toBeHidden();
            await expectAnalyticsEvents(analyticsEvents, [['Modified filter', modifiedFilterEventProperties]]);
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
            const filterDialog = page.getByRole('dialog');

            await expect(filterDialog).toBeVisible();
            await filters.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await clickOutsideDialog(filterDialog);
        });
    });

    test.describe('Filter: Date range', () => {
        const sharedModifiedDateFilterEventProperties = {
            ...sharedAnalyticsEventProperties,
            label: 'Date filter',
            actionType: 'update',
        };

        test.beforeEach(async ({ page }) => {
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
            await filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false }).click();
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
                expect(dateRangePresetSelectButton).toHaveText('Last 180 days'),

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
                expect(selectedDateRangeOption).toHaveText('Last 180 days'),
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

        test('should select another date range option', async ({ page, analyticsEvents }) => {
            const dateRange = 'Year to date';
            const datePicker = page.getByRole('dialog').nth(0);
            await selectDateRangeResetFromDatePicker(datePicker, { selection: dateRange });
            await expectAnalyticsEvents(analyticsEvents, [['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: dateRange }]]);
        });

        test('should select custom date range', async ({ page, analyticsEvents }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const today = await extractTodayDateFromDatePicker(datePicker, NOW);

            // Select today's date from the calendar
            await selectTodayDateFromDatePicker(datePicker);

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${today.timestamps}` }],
            ]);
        });

        test('should reset date range', async ({ page, analyticsEvents }) => {
            const datePicker = page.getByRole('dialog').nth(0);
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
            const today = await extractTodayDateFromDatePicker(datePicker, NOW);

            // Select today's date from the calendar
            await selectTodayDateFromDatePicker(datePicker);

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${today.timestamps}` }],
            ]);

            // Reopen datepicker and reset date range selection
            await filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false }).click();
            await resetDatePicker(datePicker, { defaultSelection: 'Last 180 days' });

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: 'Last 180 days' }],
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, actionType: 'reset' }],
            ]);
        });

        test('should close datepicker when the filter button is clicked again', async ({ page }) => {
            const filters = page.getByRole('group', { name: 'Transactions filters', exact: true });
            const filterDialog = page.getByRole('dialog');

            await expect(filterDialog).toBeVisible();
            await filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: true }).click();
            await expect(filterDialog).toBeHidden();
        });

        test('should close datepicker when clicked outside', async ({ page }) => {
            const filterDialog = page.getByRole('dialog');
            await clickOutsideDialog(filterDialog);
        });
    });
});
