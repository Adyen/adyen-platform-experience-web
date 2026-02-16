import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transaction-details--refund-not-available';

test.describe('Refund - Not available', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render payment transaction without refund button', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeHidden();
    });
});
