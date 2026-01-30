import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedTransactionsListAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-overview--error-balances';

test.describe('Error - Balances', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedTransactionsListAnalyticsEventProperties]]);
    });

    test('should render balances error alert', async ({ page }) => {
        const alert = page.locator('.adyen-pe-alert--warning');

        await expect(alert).toBeVisible();
        await expect(alert.getByText('Something went wrong, we couldn’t load the account balances.', { exact: true })).toBeVisible();
        await expect(alert.getByRole('button', { name: 'Refresh', exact: true })).toBeVisible();

        await expect(alert).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);
    });

    test('should refresh balances', async ({ page }) => {
        const refreshButton = page.locator('.adyen-pe-alert--warning').getByRole('button', { name: 'Refresh', exact: true });
        const balancesRequest = page.waitForRequest(request => request.url().endsWith('/balances'));
        await refreshButton.click();
        await balancesRequest;
    });
});
