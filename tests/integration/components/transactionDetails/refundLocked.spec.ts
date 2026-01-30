import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transaction-details--refund-locked';

test.describe('Refund - Locked', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render payment transaction with disabled refund button', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();

        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(2);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(2);

        const disabledRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(disabledRefundButton).toBeVisible();
        await expect(disabledRefundButton).toBeDisabled();
    });
});
