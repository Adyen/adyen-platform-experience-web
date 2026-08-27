import { test, expect } from '@playwright/test';
import { BalanceAccountFilter, DateRangeFilter } from '@integration-components/testing/playwright/utils/filters';

type FilterVariant = keyof (typeof BalanceAccountFilter | typeof DateRangeFilter);

export const testBalanceAccountFilter = (options: { variant: FilterVariant }) => {
    const Filter = BalanceAccountFilter[options.variant];

    test.describe('Balance account', () => {
        test.beforeEach(async ({ page }) => {
            await new Filter(page).expand('clickButton');
        });

        test('should render balance account options', async ({ page }) => {
            const filter = new Filter(page);
            await expect(filter.selected).toHaveText(/S\. Hopper - Main Account/);
            await expect(filter.selected).toHaveText(/BA32272223222B5CTDQPM6W2H/);
            await expect(filter.selected).toHaveCount(1);
            await expect(filter.unselected).toHaveCount(2);
        });

        test('should select another balance account option', async ({ page }) => {
            await new Filter(page).selectFirstUnselected();
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            await new Filter(page).collapse('clickButton');
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            await new Filter(page).collapse('clickOutside');
        });
    });
};

export const testDateRangeFilter = (options: { variant: FilterVariant; now: number }) => {
    const { now, variant } = options;

    const Filter = DateRangeFilter[variant];
    const datePickerOptions = { defaultPreset: 'Last 30 days' } as const;
    const expectTimezoneLabel = variant === 'Default';

    test.describe('Date range', () => {
        test.beforeEach(async ({ page }) => {
            await new Filter(page, datePickerOptions).expand('clickButton');
        });

        test('should render datepicker', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);

            await filter.expectPresetRange(datePickerOptions.defaultPreset);
            await expect(filter.dialog.getByRole('gridcell', { selected: true }).last()).toBeVisible();

            if (expectTimezoneLabel) {
                await expect(filter.dialog.getByText('Timezone is set on: GMT')).toBeVisible();
            }

            await filter.expectActionButtons({ apply: 'disabled', reset: 'enabled' });

            await filter.expandPreset();
            await filter.expectPresetRange(datePickerOptions.defaultPreset);
            await filter.selectUnselectedPreset('Year to date', { apply: false });
            await filter.expectActionButtons({ apply: 'enabled', reset: 'enabled' });

            await filter.expandPreset();
            await filter.expectPresetRange('Year to date');
            await filter.collapsePreset();

            await filter.selectToday({ apply: false, now });
            await filter.expectCustomRange();
            await filter.expectActionButtons({ apply: 'enabled', reset: 'enabled' });

            await filter.expandPreset();
            await filter.expectCustomRange();
            await filter.collapsePreset();
            await filter.collapse();
        });

        test('should select another date range option', async ({ page }) => {
            await new Filter(page, datePickerOptions).selectUnselectedPreset('Year to date', { apply: true });
        });

        test('should select custom date range', async ({ page }) => {
            await new Filter(page, datePickerOptions).selectToday({ apply: true, now });
        });

        test('should reset date range', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await filter.selectToday({ apply: true, now });
            await filter.reset();
        });

        test('should close datepicker when the filter button is clicked again', async ({ page }) => {
            await new Filter(page, datePickerOptions).collapse('clickButton');
        });

        test('should close datepicker when clicked outside', async ({ page }) => {
            await new Filter(page, datePickerOptions).collapse('clickOutside');
        });
    });
};
