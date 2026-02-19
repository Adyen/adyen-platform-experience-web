import type { Locator, Page } from '@playwright/test';
import { ITransactionCategory } from '../../../../../src';
import { expectAnalyticsEvents, sleep } from '../../../../utils/utils';
import { expect, type PageAnalyticsEvent } from '../../../../fixtures/analytics/events';
import {
    sharedTransactionDetailsAnalyticsEventProperties,
    sharedTransactionsInsightsAnalyticsEventProperties,
    sharedTransactionsListAnalyticsEventProperties,
} from './constants';

export const goToView = async (page: Page, analyticsEvents: PageAnalyticsEvent[], name: 'Transactions' | 'Insights') => {
    await page.getByRole('radio', { name, exact: true }).click();
    await expect(page.getByRole('radio', { name, exact: true, checked: true })).toBeVisible();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Duration', name === 'Insights' ? sharedTransactionsListAnalyticsEventProperties : sharedTransactionsInsightsAnalyticsEventProperties],
        ['Landed on page', name === 'Insights' ? sharedTransactionsInsightsAnalyticsEventProperties : sharedTransactionsListAnalyticsEventProperties],
    ]);
};

export const downloadTransactions = async (
    page: Page,
    analyticsEvents: PageAnalyticsEvent[],
    exportedFields: 'All' | 'Custom' | 'Default',
    fails = false
) => {
    const popover = page.locator('.adyen-pe-transactions-export__popover');
    const downloadPromise = fails ? undefined : page.waitForEvent('download');

    await popover.getByRole('button', { name: 'Download', exact: true }).click();
    await expectAnalyticsEvents(analyticsEvents, [['Completed export', { ...sharedTransactionsListAnalyticsEventProperties, exportedFields }]]);
    await expect(popover).toBeHidden();

    if (downloadPromise) {
        const download = await downloadPromise;
        download && expect(download.suggestedFilename()).toBe('transactions.csv');
    }
};

export const openTransactionDetailsModal = async (page: Page, analyticsEvents: PageAnalyticsEvent[], transactionRowIndex = 0) => {
    const dataGrid = page.getByRole('table');
    const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
    const transactionRow = dataGridBody.getByRole('row').nth(transactionRowIndex);

    const transactionType = await transactionRow
        .locator(`[aria-labelledby=transactionType]`)
        .textContent()
        .catch(() => 'Payment');

    await transactionRow.click();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Viewed transaction details', { ...sharedTransactionDetailsAnalyticsEventProperties, transactionType }],
        ['Landed on page', { ...sharedTransactionDetailsAnalyticsEventProperties, fromPage: 'Transactions overview' }],
    ]);
};

export const openExportPopover = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    await expect(page.locator('.adyen-pe-transactions-export__popover')).toBeVisible();
    await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...sharedTransactionsListAnalyticsEventProperties, label: 'Export' }]]);
};

export const applyPspReferenceFilter = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    const filterButton = page.getByRole('button', { name: 'PSP reference', exact: true });
    const filterDialog = page.getByRole('dialog');
    const filterValue = await filterDialog.getByLabel('PSP reference', { exact: true }).inputValue();

    const modifiedFilterEventProperties = {
        ...sharedTransactionsListAnalyticsEventProperties,
        label: 'PSP reference filter',
        value: null,
        actionType: 'update',
    } as const;

    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterButton).toHaveText(filterValue);
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [['Modified filter', modifiedFilterEventProperties]]);
};

export const resetPspReferenceFilter = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    const filterButton = page.getByRole('button', { name: 'PSP reference', exact: true });
    const filterDialog = page.getByRole('dialog');

    const sharedModifiedFilterEventProperties = {
        ...sharedTransactionsListAnalyticsEventProperties,
        label: 'PSP reference filter',
    } as const;

    // [NOTE]: Adding a tiny subsecond delay before clicking the "Reset" button to reduce flakiness
    // [TODO]: Remove this temporary sleep when the root cause of flakiness has been addressed
    await sleep(100);

    await filterDialog.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(filterButton).toHaveText('PSP reference');
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Modified filter', { ...sharedModifiedFilterEventProperties, actionType: 'update', value: null }],
        ['Modified filter', { ...sharedModifiedFilterEventProperties, actionType: 'reset' }],
    ]);
};

export const setExactPspReference = async (page: Page, analyticsEvents: PageAnalyticsEvent[], exactPspReference: string) => {
    const filterButton = page.getByRole('button', { name: 'PSP reference', exact: true });
    const filterDialog = page.getByRole('dialog');

    await filterButton.click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByLabel('PSP reference', { exact: true }).fill(exactPspReference);
    await applyPspReferenceFilter(page, analyticsEvents);
};

export const selectFirstUnselectedBalanceAccount = async (page: Page, analyticsEvents: PageAnalyticsEvent[], view: 'Insights' | 'Transactions') => {
    const filterDialog = page.getByRole('dialog');
    const firstUnselectedOption = filterDialog.getByRole('option', { selected: false }).nth(0);
    const balanceAccountId = await firstUnselectedOption.locator('.adyen-pe-balance-account-selector__account-id').textContent();

    const modifiedFilterEventProperties = {
        ...(view === 'Insights' ? sharedTransactionsInsightsAnalyticsEventProperties : sharedTransactionsListAnalyticsEventProperties),
        label: 'Balance account filter',
        value: balanceAccountId,
        actionType: 'update',
    } as const;

    await firstUnselectedOption.click();
    await expect(filterDialog).toBeHidden();
    await expectAnalyticsEvents(analyticsEvents, [['Modified filter', modifiedFilterEventProperties]]);
};

export const selectSingleCategoryFromMultiSelectFilter = async (
    page: Page,
    analyticsEvents: PageAnalyticsEvent[],
    category: ITransactionCategory
) => {
    const filterButton = page.getByRole('button', { name: 'Type', exact: true });
    const filterDialog = page.getByRole('dialog');

    const modifiedFilterEventProperties = {
        ...sharedTransactionsListAnalyticsEventProperties,
        label: 'Category filter',
        value: category,
        actionType: 'update',
    };

    await filterButton.click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByRole('option', { name: category, exact: true }).click();
    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [['Modified filter', modifiedFilterEventProperties]]);
};

export const selectSingleCurrencyFromMultiSelectFilter = async (page: Page, analyticsEvents: PageAnalyticsEvent[], currency: string) => {
    const filterButton = page.getByRole('button', { name: 'Currency', exact: true });
    const filterDialog = page.getByRole('dialog');

    const modifiedFilterEventProperties = {
        ...sharedTransactionsListAnalyticsEventProperties,
        label: 'Currency filter',
        value: currency,
        actionType: 'update',
    };

    await filterButton.click();
    await expect(filterDialog).toBeVisible();

    await filterDialog.getByRole('option', { name: currency, exact: true }).click();
    await filterDialog.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(filterDialog).toBeHidden();

    await expectAnalyticsEvents(analyticsEvents, [['Modified filter', modifiedFilterEventProperties]]);
};

export const extractTodayDateFromDatePicker = async (datePicker: Locator, now: number) => {
    const monthAndYear = (await datePicker.locator('.adyen-pe-calendar__month-name').textContent()) ?? '';
    const timezone = (await datePicker.locator('.adyen-pe-datepicker__timezone').textContent()) ?? '';
    const date = (await datePicker.locator(`[data-today='1']`).textContent()) ?? '';
    const month = monthAndYear.slice(0, 3);
    const year = monthAndYear.slice(-4);

    const formattedDate = `${month} ${date}, ${year}`;
    const startTimestamp = new Date(`${formattedDate}, 12:00 AM ${timezone.match(/(GMT\S+)\s/)?.[1] ?? ''}`).getTime();
    const endTimestamp = Math.min(startTimestamp + 86400000000, now + 1); // +1 here compensates for a time shift

    return { formattedDate, timestamps: [startTimestamp, endTimestamp] } as const;
};
