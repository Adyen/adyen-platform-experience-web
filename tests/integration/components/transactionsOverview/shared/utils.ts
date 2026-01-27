import type { Page } from '@playwright/test';
import { expectAnalyticsEvents } from '../../../../utils/utils';
import { expect, type PageAnalyticsEvent } from '../../../../fixtures/analytics/events';
import { sharedTransactionsInsightsAnalyticsEventProperties, sharedTransactionsListAnalyticsEventProperties } from './constants';
import { ITransactionCategory } from '../../../../../src';

export const goToView = async (page: Page, analyticsEvents: PageAnalyticsEvent[], name: 'Transactions' | 'Insights') => {
    await page.getByRole('radio', { name, exact: true }).click();
    await expect(page.getByRole('radio', { name, exact: true, checked: true })).toBeVisible();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Duration', name === 'Insights' ? sharedTransactionsListAnalyticsEventProperties : sharedTransactionsInsightsAnalyticsEventProperties],
        ['Landed on page', name === 'Insights' ? sharedTransactionsInsightsAnalyticsEventProperties : sharedTransactionsListAnalyticsEventProperties],
    ]);
};

export const downloadTransactions = async (page: Page, analyticsEvents: PageAnalyticsEvent[], exportedFields: 'All' | 'Custom' | 'Default') => {
    const popover = page.locator('.adyen-pe-transactions-export__popover');
    const downloadPromise = page.waitForEvent('download');

    await popover.getByRole('button', { name: 'Download', exact: true }).click();
    await expect(popover).toBeHidden();

    const download = await downloadPromise;
    await expectAnalyticsEvents(analyticsEvents, [['Completed export', { ...sharedTransactionsListAnalyticsEventProperties, exportedFields }]]);
    expect(download.suggestedFilename()).toBe('transactions.csv');
};

export const openExportPopover = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await expect(page.locator('.adyen-pe-transactions-export__popover')).toBeVisible();
    await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Export' }]]);
};

export const setExactPspReference = async (page: Page, analyticsEvents: PageAnalyticsEvent[], exactPspReference: string) => {
    const filterDialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'PSP reference', exact: true }).click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByLabel('PSP reference', { exact: true }).fill(exactPspReference);
    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Modified filter', { ...sharedTransactionsListAnalyticsEventProperties, label: 'PSP reference filter', value: null }],
    ]);
};

export const selectSingleCategoryFromMultiSelectFilter = async (
    page: Page,
    analyticsEvents: PageAnalyticsEvent[],
    category: ITransactionCategory
) => {
    const filterDialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Type', exact: true }).click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByText(category, { exact: true }).click();
    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Modified filter', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Category filter', value: category }],
    ]);
};

export const selectSingleCurrencyFromMultiSelectFilter = async (page: Page, analyticsEvents: PageAnalyticsEvent[], currency: string) => {
    const filterDialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Currency', exact: true }).click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByText(currency, { exact: true }).click();
    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Modified filter', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Currency filter', value: currency }],
    ]);
};
