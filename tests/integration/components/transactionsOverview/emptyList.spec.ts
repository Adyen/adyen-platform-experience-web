import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-overview--empty-list';

test.describe('Empty list', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should render "No transactions found" message', async ({ page }) => {
        await expect(page.getByText('No transactions found', { exact: true })).toBeVisible();
        await expect(page.getByText('Try a different search or reset your filters, and we’ll try again.', { exact: true })).toBeVisible();
    });

    test('should render data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();
    });

    test('should render disabled pagination buttons', async ({ page }) => {
        const prevPageButton = page.getByRole('button', { name: 'Previous page', exact: true });
        const nextPageButton = page.getByRole('button', { name: 'Next page', exact: true });

        await expect(prevPageButton).toBeVisible();
        await expect(nextPageButton).toBeVisible();

        await expect(prevPageButton).toBeDisabled();
        await expect(nextPageButton).toBeDisabled();
    });

    test('should render disabled "Export" button', async ({ page }) => {
        const exportButton = page.getByRole('button', { name: 'Export', exact: true });
        await expect(exportButton).toBeVisible();
        await expect(exportButton).toBeDisabled();
    });

    test('should render zero transaction totals', async ({ page }) => {
        let totalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: false });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('$0.00', { exact: true })).toHaveCount(2);
        await expect(totalsCard.getByText('USD', { exact: true })).toHaveCount(1);

        await totalsCard.click();

        // expanded totals card
        totalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: true });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('$0.00', { exact: true })).toHaveCount(2);
        await expect(totalsCard.getByText('USD', { exact: true })).toHaveCount(1);
        await expect(totalsCard.getByText('€0.00', { exact: true })).toHaveCount(2);
        await expect(totalsCard.getByText('EUR', { exact: true })).toHaveCount(1);
    });
});
