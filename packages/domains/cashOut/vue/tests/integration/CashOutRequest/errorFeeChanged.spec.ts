import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--fee-changed';

// The fee configuration changes after the fee of the amount is shown, so the API rejects the cashOut instead of charging another fee
test.describe('CashOut Request - Error - Fee changed', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await expect(root.getByRole('status')).toContainText('You will receive $216.20');
    });

    test('should send the fee shown as the expected fee, then show the error screen instead of the form', async ({ page }) => {
        const root = getComponentRoot(page);

        const cashOutRequest = waitForCashOutRequest(page);
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ amount: 22000, currency: 'USD', expectedFee: 380 });
        await Promise.all([
            expect(root.getByRole('alert').getByText('Something went wrong', { exact: true })).toBeVisible(),
            expect(root.getByRole('alert').getByText('Please try again', { exact: true })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
            expect(root.getByText('CashOut successful')).toHaveCount(0),
        ]);
    });
});
