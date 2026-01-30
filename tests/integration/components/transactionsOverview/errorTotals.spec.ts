import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';
import { goToView } from './shared/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--error-totals';

test.describe('Error - Totals', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test.describe('Transactions view', () => {
        test('should render totals error alert', async ({ page }) => {
            const alert = page.locator('.adyen-pe-alert--warning');

            await expect(alert).toBeVisible();
            await expect(alert.getByText('Something went wrong, we couldn’t load totals.', { exact: true })).toBeVisible();
            await expect(alert.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible();

            await expect(alert).toHaveCount(1);
            await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);
        });

        test('should refresh totals', async ({ page }) => {
            const refreshButton = page.locator('.adyen-pe-alert--warning').getByRole('button', { name: 'Refresh', exact: true });
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
            await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
            await expect(page.getByText('Try refreshing the page or come back later.')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible();
        });

        test('should refresh totals', async ({ page }) => {
            const refreshButton = page.getByRole('button', { name: 'Refresh', exact: true });
            const totalsRequest = page.waitForRequest(request => request.url().includes('/transactions/totals'));
            await refreshButton.click();
            await totalsRequest;
        });
    });
});
