import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--view-only';

test.describe('CashOut Overview - View only - Role not assigned', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should still offer to start a cashOut', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('$220.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeEnabled(),
        ]);
    });

    test('should show the request without offering to send it', async ({ page }) => {
        await getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' }).click();
        const modal = page.getByRole('dialog', { name: 'Instant CashOut request' });

        await Promise.all([
            expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('220.00'),
            expect(modal.getByRole('status')).toContainText('You will receive $216.20 USD'),
            expect(modal.getByRole('button', { name: 'Cash out now' })).toHaveCount(0),
            expect(modal.getByRole('button', { name: 'Cancel' })).toHaveCount(0),
        ]);
    });
});
