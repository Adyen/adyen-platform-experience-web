import { test } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--daily-limit-reached';

test.describe('CashOut Request - Unavailable - Daily limit reached', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should explain why cashOut is unavailable, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await expectUnavailable(root, {
            amount: '€0.00',
            message: "You've reached the instant CashOut limit for the last 24 hours. Try again later.",
        });
    });
});
