import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { loadAvailableAmountsAgain } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--available-amounts-changed';

// The available amounts are loaded again once the list of balance accounts closes, and tell the selected one can cash out less than its
// eligibility told: the form follows, as the newest tells it
test.describe('CashOut Request - Available amounts changed', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(getComponentRoot(page).getByText('You have $220.00 available to cash out')).toBeVisible();
    });

    // The amount filled in is what was available, so it follows what is available
    test('should fill in what the selected balance account can cash out as the amounts loaded again tell it', async ({ page }) => {
        const root = getComponentRoot(page);

        await loadAvailableAmountsAgain(page);

        await Promise.all([
            expect(root.getByText('You have $150.00 available to cash out')).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('150.00'),
            expect(root.getByRole('status')).toContainText('You will receive $147.25'),
        ]);
    });

    // Only a changed amount has other fees, so they aren't asked for again while the amounts loaded again tell the same
    test('should not ask for the fees again when the amounts loaded again tell the same', async ({ page }) => {
        const root = getComponentRoot(page);
        await loadAvailableAmountsAgain(page);
        await expect(root.getByRole('status')).toContainText('You will receive $147.25');

        const amountsLoadedAgain = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/cashout/availableAmounts'));
        await loadAvailableAmountsAgain(page, '$150.00');
        await amountsLoadedAgain;

        // Fees would be asked for at the latest once the amount stops changing, which takes less than this
        const feesRequest = page.waitForRequest(request => new URL(request.url()).pathname.endsWith('/cashout/fees'), { timeout: 2000 });
        await expect(feesRequest).rejects.toThrow();
        await expect(root.getByRole('status')).toContainText('You will receive $147.25');
    });

    test('should keep the amount entered, and tell it is above what the selected balance account can cash out by then', async ({ page }) => {
        const root = getComponentRoot(page);
        const amountField = root.getByRole('spinbutton', { name: 'Amount to cash out' });
        await amountField.fill('200');
        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled();

        await loadAvailableAmountsAgain(page);

        await Promise.all([
            expect(root.getByText('You have $150.00 available to cash out')).toBeVisible(),
            expect(amountField).toHaveValue('200'),
            expect(root.getByText('Enter an amount up to $150.00.')).toBeVisible(),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
        ]);
    });
});
