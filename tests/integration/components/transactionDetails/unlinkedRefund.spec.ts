import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transaction-details--unlinked-refund';

test.describe('Unlinked refund', () => {
    test('should render partial refund transaction', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);

        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Refund' })).toBeVisible();

        await expect(page.getByRole('button', { name: 'Go back', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Go to payment', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Return to refund', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeHidden();
    });
});
