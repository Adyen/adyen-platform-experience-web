import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';
import { goToView } from '../../../../fixtures/integration/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--error-totals';

test.describe('Error - Totals', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('Transactions view', () => {
        test('should render totals error alert', async ({ page }) => {
            const alert = page.getByRole('alert');
            await expect(alert).toBeVisible();
            await expect(alert).toHaveCount(1);
            await expect(alert.getByText('Something went wrong, we couldn’t load totals.', { exact: true })).toBeVisible();
            await expect(alert.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible();
        });

        test('should refresh totals', async ({ page }) => {
            const refreshButton = page.getByRole('alert').getByRole('button', { name: 'Refresh', exact: true, disabled: false });
            const totalsRequest = page.waitForRequest(request => request.url().includes('/transactions/totals'));
            await refreshButton.click();
            await totalsRequest;
        });
    });

    test.describe('Insights view', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await goToView(page, analyticsEvents, 'Insights');
        });

        test('should render totals error display', async ({ page }) => {
            // [TODO]: Address incomplete error messages.
            test.fixme(true, 'Incomplete error messages');

            await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
            await expect(page.getByText('Try refreshing the page or come back later.')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible();
        });

        test('should refresh totals', async ({ page }) => {
            const refreshButton = page.getByRole('button', { name: 'Refresh', exact: true, disabled: false });
            const totalsRequest = page.waitForRequest(request => request.url().includes('/transactions/totals'));
            await refreshButton.click();
            await totalsRequest;
        });
    });
});
