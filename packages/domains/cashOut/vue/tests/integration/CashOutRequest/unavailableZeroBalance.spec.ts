import { test } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--zero-balance';

test.describe('CashOut Request - Unavailable - Zero balance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show nothing to cash out, without an alert, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await expectUnavailable(root, { amount: '€0.00' });
    });
});
