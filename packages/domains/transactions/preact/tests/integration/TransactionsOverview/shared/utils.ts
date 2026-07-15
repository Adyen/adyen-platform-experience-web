import type { Page } from '@playwright/test';
import { ITransactionCategory } from '@integration-components/types';
import { sleep } from '@integration-components/testing/fixtures/utils';
import { expectAnalyticsEvents } from '@integration-components/testing/playwright/utils';
import { expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import {
    sharedTransactionDetailsAnalyticsEventProperties,
    sharedTransactionsListAnalyticsEventProperties,
} from '../../../../../fixtures/constants/TransactionsOverview';

export const downloadTransactions = async (
    page: Page,
    analyticsEvents: PageAnalyticsEvent[],
    exportedFields: 'All' | 'Custom' | 'Default',
    fails = false
) => {
    const popover = page.getByTestId('transactions-export-popover');
    const downloadPromise = fails ? undefined : page.waitForEvent('download');

    await popover.getByRole('button', { name: 'Download', exact: true, disabled: false }).click();
    await expectAnalyticsEvents(analyticsEvents, [['Completed export', { ...sharedTransactionsListAnalyticsEventProperties, exportedFields }]]);
    await expect(popover).toBeHidden();

    if (downloadPromise) {
        const download = await downloadPromise;
        if (download) {
            expect(download.suggestedFilename()).toBe('transactions.csv');
        }
    }
};

export const openTransactionDetailsModal = async (page: Page, analyticsEvents: PageAnalyticsEvent[], transactionRowIndex = 0) => {
    const dataGrid = page.getByRole('table');
    const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
    const transactionRow = dataGridBody.getByRole('row').nth(transactionRowIndex);

    const transactionType = await transactionRow
        .getByTestId('transactionType')
        .textContent()
        .catch(() => 'Payment');

    await transactionRow.click();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Viewed transaction details', { ...sharedTransactionDetailsAnalyticsEventProperties, transactionType }],
        ['Landed on page', { ...sharedTransactionDetailsAnalyticsEventProperties, fromPage: 'Transactions overview' }],
    ]);
};

export const openExportPopover = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Export', exact: true, disabled: false, expanded: false }).click();
    await expect(page.getByTestId('transactions-export-popover')).toBeVisible();
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
