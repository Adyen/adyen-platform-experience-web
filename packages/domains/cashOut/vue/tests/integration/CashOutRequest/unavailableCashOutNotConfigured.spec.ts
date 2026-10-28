import { test } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--cash-out-not-configured';

test.describe('CashOut Request - Unavailable - CashOut not configured', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should explain why cashOut is unavailable, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€1,000.00',
            message: "Instant CashOut isn't available for this account. Contact support for help.",
        });
    });
});
