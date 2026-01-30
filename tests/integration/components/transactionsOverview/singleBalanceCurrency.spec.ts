import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';
import { goToView } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--single-balance-currency';

test.describe('Single balance currency', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('Transactions view', () => {
        test('should not render currency selector in the filter bar', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Type', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeHidden(); // hidden currency
            await expect(page.getByRole('button', { name: 'PSP reference', exact: true })).toBeVisible();
        });

        test('should not render currency column in the data grid', async ({ page }) => {
            const dataGrid = page.getByRole('table');
            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeHidden();
            await expect(dataGrid.getByRole('columnheader', { name: 'Net amount ($)', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount ($)', exact: true })).toBeVisible();
        });

        test('should render transaction totals and account balances in non-expandable card', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Show all transaction totals', exact: true, expanded: false })).toBeHidden();
            await expect(page.getByRole('list', { name: 'Transaction totals', exact: true })).toBeVisible();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();

            await expect(page.getByRole('button', { name: 'Show all account balances', exact: true, expanded: false })).toBeHidden();
            await expect(page.getByRole('list', { name: 'Account balances', exact: true })).toBeVisible();
            await expect(page.getByText('Available balance', { exact: true })).toBeVisible();
            await expect(page.getByText('Reserved balance', { exact: true })).toBeVisible();

            await expect(page.getByText('USD', { exact: true })).toHaveCount(2);
        });
    });

    test.describe('Insights view', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Insights');
        });

        test('should not render currency selector in the filter bar', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Balance account', exact: true })).toBeHidden();
            await expect(page.getByRole('button', { name: 'Date range', exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeHidden(); // hidden currency
        });

        test('should render period totals', async ({ page }) => {
            await expect(page.getByText('Period result', { exact: true })).toBeVisible();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(page.getByText('USD', { exact: true }).first()).toBeVisible();
        });
    });
});
