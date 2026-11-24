import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { OVERVIEW_ANALYTICS } from '../shared/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--cash-out-not-configured';

test.describe('CashOut Overview - Unavailable - CashOut not configured', () => {
    test('should explain that cashOut is not allowed for this account, and not offer to start one', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€1,000.00',
            message: "Instant CashOut isn't available for this account. Contact support for help.",
        });
        await expect(root.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });

    test('should offer contact support when the integration handles it', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await expect(getComponentRoot(page).getByRole('status').getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });

    test('should tell the reach out button was clicked, with the reason', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Landed on page', { ...OVERVIEW_ANALYTICS, isAvailable: false, unavailableReason: 'cashOutNotConfigured', currency: 'EUR' }],
        ]);

        await getComponentRoot(page).getByRole('status').getByRole('button', { name: 'Reach out to support' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...OVERVIEW_ANALYTICS, label: 'Contact support', unavailableReason: 'cashOutNotConfigured' }],
        ]);
    });
});
