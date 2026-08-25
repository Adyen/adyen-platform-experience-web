import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
import { goToView } from '../../../../fixtures/integration/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--single-balance-currency';

test.describe('Single balance currency', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('Transactions view', () => {
        test('should not render currency selector in the filter bar', async ({ page }) => {
            const toolbar = page.getByRole('toolbar');
            await expect(toolbar.getByRole('button', { name: /^Balance account/ })).toBeHidden();
            await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Type/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Currency/ })).toBeHidden(); // hidden currency
            await expect(toolbar.getByRole('button', { name: /^PSP reference/, disabled: false })).toBeVisible();
        });

        test('should not render currency column in the data grid', async ({ page }) => {
            const dataGrid = page.getByRole('grid');
            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Payment method', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Transaction type', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Currency', exact: true })).toBeHidden();
            await expect(dataGrid.getByRole('columnheader', { name: 'Net amount ($)', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Gross amount ($)', exact: true })).toBeVisible();
        });

        test('should render transaction totals and account balances in non-expandable card', async ({ page }) => {
            // [TODO]: Fix accessible names for the totals and balances expandable cards
            await expect(page.getByRole('button', { name: /^Total/i, expanded: false })).toBeHidden();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();

            await expect(page.getByRole('button', { name: /Balance$/i, expanded: false })).toBeHidden();
            await expect(page.getByText('Available balance', { exact: true })).toBeVisible();
            await expect(page.getByText('Reserved balance', { exact: true })).toBeVisible();

            await expect(page.getByText(/USD/)).toHaveCount(4);
        });
    });

    test.describe('Insights view', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Insights');
        });

        test('should not render currency selector in the filter bar', async ({ page }) => {
            const toolbar = page.getByRole('toolbar');
            await expect(toolbar.getByRole('button', { name: /^Balance account/ })).toBeHidden();
            await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Currency/ })).toBeHidden(); // hidden currency
        });

        test('should render period totals', async ({ page }) => {
            await expect(page.getByText('Period result', { exact: true })).toBeVisible();
            await expect(page.getByText('Total incoming', { exact: true })).toBeVisible();
            await expect(page.getByText('Total outgoing', { exact: true })).toBeVisible();
            await expect(page.getByText('USD', { exact: true }).first()).toBeVisible();
        });
    });
});
