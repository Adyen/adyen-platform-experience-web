import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';

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
        const dataGrid = page.getByRole('grid');
        await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Net amount', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount', exact: true })).toBeVisible();
    });

    test('should render disabled pagination buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Previous page/i, disabled: true })).toBeVisible();
        await expect(page.getByRole('button', { name: /Next page/i, disabled: true })).toBeVisible();
    });

    test('should render disabled "Export" button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Export', exact: true, disabled: true, expanded: false })).toBeVisible();
    });

    test('should render zero transaction totals', async ({ page }) => {
        let totalsCard = page.getByRole('button', { name: /^Total/i, expanded: false });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('0.00 USD', { exact: true })).toHaveCount(2);

        await totalsCard.click();

        // expanded totals card
        totalsCard = page.getByRole('button', { name: /^Total/i, expanded: true });

        await expect(totalsCard).toBeVisible();
        await expect(totalsCard.getByText('Total incoming', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('Total outgoing', { exact: true })).toBeVisible();
        await expect(totalsCard.getByText('0.00 USD', { exact: true })).toHaveCount(2);
        // [TODO]: Define proper accessibility hierarchy for expandable card
        await expect(page.getByRole('listitem').getByText('0.00 EUR', { exact: true })).toHaveCount(2);
    });
});
