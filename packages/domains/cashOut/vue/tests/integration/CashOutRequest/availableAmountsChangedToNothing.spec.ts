import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--available-amounts-changed-to-nothing';

// The available amounts loaded again tell the selected balance account has nothing left to cash out, so it can't cash out, like the API
// would tell it
test.describe('CashOut Request - Available amounts changed to nothing', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(getComponentRoot(page).getByRole('spinbutton', { name: 'Amount to cash out' })).toBeEnabled();
    });

    test('should show nothing to cash out, with the form disabled', async ({ page }) => {
        const root = getComponentRoot(page);

        await loadAvailableAmountsAgain(page);

        await Promise.all([
            expect(root.getByText('You have $0.00 available to cash out')).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toBeDisabled(),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });
});
