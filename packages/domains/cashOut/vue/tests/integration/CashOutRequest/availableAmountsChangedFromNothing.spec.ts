import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain, recordRequests } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--available-amounts-changed-from-nothing';

// The available amounts loaded again tell the selected balance account, which had nothing to cash out, has something to cash out again. An
// amount alone can't make a cashOut available, as its bank accounts and the other checks of the API come with its eligibility, so the
// eligibility is loaded again instead
test.describe('CashOut Request - Available amounts changed from nothing', () => {
    test('should load the eligibility again, then offer to cash out what it tells', async ({ page }) => {
        const eligibilityRequests = recordRequests(page, '/cashout/eligibility');
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);
        const amountField = root.getByRole('spinbutton', { name: 'Amount to cash out' });
        await Promise.all([expect(root.getByText('You have $0.00 available to cash out')).toBeVisible(), expect(amountField).toBeDisabled()]);

        await loadAvailableAmountsAgain(page, '$0.00');

        await Promise.all([
            expect(root.getByText('You have $220.00 available to cash out')).toBeVisible(),
            expect(amountField).toBeEnabled(),
            expect(amountField).toHaveValue('220.00'),
        ]);
        expect(eligibilityRequests).toHaveLength(2);
    });
});
