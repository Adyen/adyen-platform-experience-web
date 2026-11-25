import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--available-amounts-changed';

// The available amounts are loaded again once the list of balance accounts closes, and tell the selected one can cash out less
// than its eligibility told: the component and the list agree on it, as the newest tells it
test.describe('CashOut Overview - Available amounts changed', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();
    });

    test('should show what the selected balance account can cash out as the amounts loaded again tell it', async ({ page }) => {
        const root = getComponentRoot(page);

        await loadAvailableAmountsAgain(page);

        await expect(root.getByText('$150.00', { exact: true })).toBeVisible();
        await root.getByRole('combobox', { name: 'Balance account' }).click();
        await expect(root.getByRole('option', { name: 'S. Hopper - Main Account' })).toContainText('$150.00 to cash out');
    });

    test('should open the request with what the selected balance account can cash out as the amounts loaded again tell it', async ({ page }) => {
        await loadAvailableAmountsAgain(page);
        await expect(getComponentRoot(page).getByText('$150.00', { exact: true })).toBeVisible();

        const modal = await openRequestModal(page);

        await Promise.all([
            expect(modal.getByText('You have $150.00 available to cash out')).toBeVisible(),
            expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('150.00'),
        ]);
    });

    // Refreshing loads the eligibility again, which then tells it, as the newest
    test('should show what the eligibility tells again once refreshed', async ({ page }) => {
        const root = getComponentRoot(page);
        await loadAvailableAmountsAgain(page);
        await expect(root.getByText('$150.00', { exact: true })).toBeVisible();

        await root.getByRole('button', { name: 'Refresh' }).click();

        await expect(root.getByText('$220.00', { exact: true })).toBeVisible();
    });
});
