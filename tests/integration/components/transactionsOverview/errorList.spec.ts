import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should render error message', async ({ page }) => {
        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your transactions. Contact support for help and share error code")).toBeVisible();
    });

    test('should render error message with support button when "onContactSupport" is enabled', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your transactions. The error code is")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeVisible();
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
        let transactionTotalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: false });

        await expect(transactionTotalsCard).toBeVisible();
        await expect(transactionTotalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('$0.00', { exact: true })).toHaveCount(2);
        await expect(transactionTotalsCard.getByText('USD', { exact: true })).toHaveCount(1);

        await transactionTotalsCard.click();

        // expanded transaction totals card
        transactionTotalsCard = page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: true });

        await expect(transactionTotalsCard).toBeVisible();
        await expect(transactionTotalsCard.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(transactionTotalsCard.getByText('$0.00', { exact: true })).toHaveCount(2);
        await expect(transactionTotalsCard.getByText('USD', { exact: true })).toHaveCount(1);
        await expect(transactionTotalsCard.getByText('€0.00', { exact: true })).toHaveCount(2);
        await expect(transactionTotalsCard.getByText('EUR', { exact: true })).toHaveCount(1);
    });
});

test.describe('onContactSupport argument', () => {
    test('should render error message with button to contact support', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your transactions. The error code is")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeVisible();
    });
});
