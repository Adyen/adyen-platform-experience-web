import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BalanceAccountFilter, DateRangeFilter } from '@integration-components/testing/playwright/utils/filters';

type FilterVariant = keyof (typeof BalanceAccountFilter | typeof DateRangeFilter);

export const testBalanceAccountFilter = (options: { variant: FilterVariant; getReportRows: (page: Page) => Locator; reportsPerPage: number }) => {
    const { variant, getReportRows, reportsPerPage } = options;

    const Filter = BalanceAccountFilter[variant];
    const mainAccountLabel = variant === 'Bento' ? /S\. Hopper - (Main Account)?/ : 'S. Hopper - Main Account';
    const secondaryAccountLabel = variant === 'Bento' ? /S\. Hopper - (Secondary Account)?/ : 'S. Hopper - Secondary Account';

    test.describe('Balance account', () => {
        test('should show balance account selector on load', async ({ page }) => {
            const filter = new Filter(page);
            await expect(filter.button).toBeVisible();
            await expect(filter.button).toHaveText(mainAccountLabel);
        });

        test('should open selector dialog', async ({ page }) => {
            const filter = new Filter(page);
            await filter.expand('clickButton');
            await expect(filter.selected).toHaveCount(1);
            await expect(filter.unselected).toHaveCount(2);
        });

        test('should list all balance accounts with description and number', async ({ page }) => {
            const filter = new Filter(page);
            await filter.expand('clickButton');

            await expect(filter.selected).toHaveText(/S\. Hopper - Main Account/);
            await expect(filter.selected).toHaveText(/BA32272223222B5CTDQPM6W2H/);

            await expect(filter.dialog.getByText('S. Hopper - Secondary Account', { exact: true })).toBeVisible();
            await expect(filter.dialog.getByText('BA32272223222B5CTDQPM6W2K', { exact: true })).toBeVisible();
        });

        test('should select a balance account and reload table', async ({ page }) => {
            const rows = getReportRows(page);
            await expect(rows).toHaveCount(reportsPerPage);

            const filter = new Filter(page);
            await filter.expand('clickButton');

            const reportsRequest = page.waitForRequest(request => {
                const url = request.url();
                const id = 'BA32272223222B5CTDQPM6W2G'; // Secondary balance account
                return url.includes('/reports') && url.includes(`balanceAccountId=${id}`);
            });

            // Select secondary balance account
            await filter.selectFirstUnselected();
            await reportsRequest;

            await expect(filter.button).toHaveText(secondaryAccountLabel);
            await expect(rows).toHaveCount(reportsPerPage);
        });

        test('should close selector by clicking outside', async ({ page }) => {
            const filter = new Filter(page);
            await filter.expand('clickButton');
            await filter.collapse('clickOutside');
        });
    });
};

export const testDateRangeFilter = (options: { variant: FilterVariant; now: number }) => {
    const { now, variant } = options;
    const Filter = DateRangeFilter[variant];
    const datePickerOptions = { defaultPreset: 'Last 30 days' } as const;

    test.describe('Date range', () => {
        test('should show date filter', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await expect(filter.button).toBeVisible();
        });

        test('should open date picker dialog', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await filter.expand('clickButton');
        });

        test('should apply a preset date range', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await filter.selectUnselectedPreset('Year to date', { apply: true });
        });

        test('should reset date filter', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await filter.selectToday({ apply: true, now });
            await filter.reset();
        });
    });
};
