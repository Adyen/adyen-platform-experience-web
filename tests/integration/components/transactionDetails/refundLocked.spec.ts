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
        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        await expect(page.getByText('Partially refunded', { exact: true })).toBeVisible();

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toHaveCount(2);

        const disabledRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(disabledRefundButton).toBeVisible();
        await expect(disabledRefundButton).toBeDisabled();
    });
});
