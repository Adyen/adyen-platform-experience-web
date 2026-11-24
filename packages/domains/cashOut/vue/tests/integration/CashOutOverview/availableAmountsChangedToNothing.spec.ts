import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain } from '../shared/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--available-amounts-changed-to-nothing';

// The available amounts loaded again tell the selected balance account has nothing left to cash out, so it can't cash out, like the API
// would tell it
test.describe('CashOut Overview - Available amounts changed to nothing', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled();
    });

    test('should show nothing to cash out and not offer to start a cashOut', async ({ page }) => {
        await loadAvailableAmountsAgain(page);

        await expectUnavailable(getComponentRoot(page), { amount: '$0.00' });
    });
});
