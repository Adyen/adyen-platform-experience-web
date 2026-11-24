import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain, recordRequests } from '../shared/utils';
import { expectUnavailable } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--available-amounts-changed-from-nothing';

// The available amounts loaded again tell the selected balance account, which had nothing to cash out, has something to cash out again. An
// amount alone can't make a cashOut available, as its bank accounts and the other checks of the API come with its eligibility, so the
// eligibility is loaded again instead
test.describe('CashOut Overview - Available amounts changed from nothing', () => {
    test('should load the eligibility again, then offer to cash out what it tells', async ({ page }) => {
        const eligibilityRequests = recordRequests(page, '/cashout/eligibility');
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);
        await expectUnavailable(root, { amount: '$0.00' });

        await loadAvailableAmountsAgain(page, '$0.00');

        await Promise.all([
            expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
        expect(eligibilityRequests).toHaveLength(2);
    });
});
