import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, getTranslatedKey, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';
import { CUSTOM_URL_EXAMPLE } from '../../../../stories/utils/constants';
import { openTransactionDetailsModal } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Customized translation', { category: 'PIE', subCategory: 'Core', locale: 'en-US', keys: [] }],
            ['Landed on page', sharedTransactionsListAnalyticsEventProperties],
        ]);
    });

    test('should not render hidden data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeHidden(); // hidden column
        await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();
    });

    test('should render custom data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        await expect(dataGrid.getByRole('columnheader', { name: 'Store', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Product', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Reference', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();
    });

    test('should render correct data for each custom column', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
        const firstRow = dataGridBody.getByRole('row').nth(0);

        const productCell = firstRow.locator(`[aria-labelledby=_product]`);
        const storeCell = firstRow.locator(`[aria-labelledby=_store]`);
        const referenceCell = firstRow.locator(`[aria-labelledby=_reference]`);
        const actionCell = firstRow.locator(`[aria-labelledby=_button]`);

        await expect(productCell).toHaveText('Bubble tea');
        await expect(storeCell).toHaveText('Sydney');
        await expect(storeCell.getByRole('img')).toBeAttached();
        await expect(referenceCell).toHaveText('8W54BM75W7DYCIVK');

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'), // Waits for a new 'page' event in this browser context
            referenceCell.click(), // This click opens the link in a new tab
        ]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const messages: string[] = [];

        page.once('console', message => {
            messages.push(message.text());
        });

        await actionCell.getByRole('button').click();
        expect(messages).toContain('Action');
    });

    test('should render transaction details modal for clicked row', async ({ page, analyticsEvents }) => {
        await openTransactionDetailsModal(page, analyticsEvents, 0 /* first row transaction */);

        const detailsModal = page.getByRole('dialog');
        await detailsModal.getByRole('tab', { name: 'Details', exact: true }).click();

        const referenceID = detailsModal.getByTestId(`${getTranslatedKey('transactions.details.fields.referenceID')}`).locator('dd');
        await expect(referenceID).toHaveText('8W54BM75W7DYCIVK');
    });
});
