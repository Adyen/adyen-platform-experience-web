import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transaction-details--refunded-partially-with-statuses';

test.describe('Refunded - Partially (statuses)', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render partially refunded payment transaction', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        const failedRefundAlert =
            'The refund for €37.50, €50.00, and €58.75 has failed. It is not currently possible to refund this amount. Please contact support.';

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The partial refund of €75.00 is being processed.', { exact: true })).toBeVisible();
        await expect(page.getByText(failedRefundAlert, { exact: true })).toBeVisible();

        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(2);
        await expect(page.locator('.adyen-pe-alert--warning')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(3);

        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeVisible();
    });
});
