import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transaction-details--refunded-fully';

test.describe('Refunded - Fully', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render fully refunded payment transaction', async ({ page }) => {
        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        await expect(page.getByText('Fully refunded', { exact: true })).toBeVisible();

        await expect(page.getByText('The full amount has been refunded back to the customer', { exact: true })).toBeVisible();
        await expect(page.getByRole('alert')).toHaveCount(1);

        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeHidden();
    });
});
