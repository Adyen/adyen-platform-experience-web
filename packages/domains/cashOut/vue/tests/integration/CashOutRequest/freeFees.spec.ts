import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--free-fees';

test.describe('CashOut Request - Free fees', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show the fees as free, and that all of the amount will be received', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('You have $220.00 available to cash out')).toBeVisible(),
            expect(root.getByRole('definition')).toHaveText(['Free']),
            expect(root.getByLabel('There is no fee for instant CashOuts.')).toBeVisible(),
            expect(root.getByRole('status')).toContainText('You will receive $220.00'),
        ]);
    });

    test('should cash out with no fee as the expected fee', async ({ page }) => {
        const root = getComponentRoot(page);
        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await expect(root.getByRole('status')).toContainText('You will receive $220.00');

        const cashOutRequest = waitForCashOutRequest(page);
        await root.getByRole('button', { name: 'Cash out now' }).click();

        expect((await cashOutRequest).postDataJSON()).toMatchObject({ amount: 22000, currency: 'USD', expectedFee: 0 });
        await expect(root.getByText('CashOut successful')).toBeVisible();
    });
});
