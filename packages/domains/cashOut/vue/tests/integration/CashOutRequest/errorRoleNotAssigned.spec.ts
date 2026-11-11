import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--role-not-assigned';

test.describe('CashOut Request - Error - Role not assigned', () => {
    test('should show that the component is unavailable instead of the form', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Contact support for help.")).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Cash out now' })).toHaveCount(0),
        ]);
    });
});
