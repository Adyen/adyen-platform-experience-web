import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import { openTransactionDetailsModal } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(
            analyticsEvents,
            [
                ['Customized translation', { category: 'PIE', subCategory: 'Core', locale: 'en-US', keys: [] }],
                ['Landed on page', sharedTransactionsListAnalyticsEventProperties],
            ],
            { strictOrder: false }
        );
    });

    test('should not render hidden data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('grid');
        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeHidden(); // hidden column
        await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();
    });

    test('should retain the mobile table layout without custom columns', async ({ page }) => {
        await page.setViewportSize({ width: 479, height: 800 });

        const dataGrid = page.getByRole('grid');
        await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toHaveCount(0);
        await expect(dataGrid.getByRole('columnheader', { name: 'Store', exact: true })).toHaveCount(0);
        await expect(dataGrid.getByRole('columnheader', { name: 'Product', exact: true })).toHaveCount(0);
        await expect(dataGrid.getByRole('columnheader', { name: 'Reference', exact: true })).toHaveCount(0);
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toHaveCount(0);
    });

    test('should render custom data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('grid');
        await expect(dataGrid.getByRole('columnheader', { name: 'Store', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Product', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Reference', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();
    });

    test('should render correct data for each custom column', async ({ page }) => {
        const dataGrid = page.getByRole('grid');
        const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
        const firstRow = dataGridBody.getByRole('row').nth(0);

        const productCell = firstRow.getByTestId('cell-_product');
        const storeCell = firstRow.getByTestId('cell-_store');
        const referenceCell = firstRow.getByTestId('cell-_reference');
        const actionCell = firstRow.getByTestId('cell-_button');

        await expect(productCell).toHaveText('Bubble tea');
        await expect(storeCell).toHaveText('Sydney');
        await expect(storeCell.getByRole('img')).toBeAttached();
        await expect(referenceCell).toHaveText('8W54BM75W7DYCIVK');

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'), // Waits for a new 'page' event in this browser context
            referenceCell.getByRole('link').click(), // This click opens the link in a new tab
        ]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const actionPromise = page.waitForEvent('console', {
            predicate: message => message.text() === 'Action',
        });

        await actionCell.getByRole('button').click();
        await actionPromise;
    });

    test('should render transaction details modal for clicked row', async ({ page, analyticsEvents }) => {
        await openTransactionDetailsModal(page, analyticsEvents, 0 /* first row transaction */);

        const detailsModal = page.getByRole('dialog');
        await detailsModal.getByRole('tab', { name: 'Details', exact: true }).click();
        await expect(page.getByText('8W54BM75W7DYCIVK', { exact: true }).first()).toBeVisible();
    });
});
