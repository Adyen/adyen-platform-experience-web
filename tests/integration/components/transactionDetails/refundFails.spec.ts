import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';

const sharedAnalyticsEventProperties = {
    componentName: 'transactionDetails',
    category: 'Transaction component',
    subCategory: 'Transaction details',
} as const;

const STORY_ID = 'mocked-transactions-transaction-details--refund-fails';

test.describe('Refund - Fails', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render payment transaction', async ({ page }) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeVisible();
    });

    test('should fail to refund payment', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Refund payment', exact: true }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Switched to refund view', sharedAnalyticsEventProperties]]);

        await page.getByRole('button', { name: 'Refund €133.75', exact: true }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Completed refund', sharedAnalyticsEventProperties]]);

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText('We couldn’t process the refund. Try again later.', { exact: true })).toBeVisible();

        const backButton = page.getByRole('button', { name: 'Go back', exact: true });
        await expect(backButton).toBeVisible();

        await backButton.click();

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        const refundPaymentButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(refundPaymentButton).toBeVisible();
        await expect(refundPaymentButton).toBeEnabled(); // still enabled
    });
});
