import { test, expect, type Page } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { refreshFromHeader } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--cash-out-still-processing';

test.describe('CashOut Overview - CashOut still processing', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    const cashOut = async (page: Page, amount: string) => {
        const modal = await openRequestModal(page);
        await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill(amount);
        await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await modal.getByRole('button', { name: 'Cash out now' }).click();
        await expect(modal.getByText('CashOut successful')).toBeVisible();
        await modal.getByRole('button', { name: 'Close' }).click();
        await expect(modal).toBeHidden();
    };

    test('should show what is expected to be available after the cashOut, while the API still shows the amount from before it', async ({ page }) => {
        const root = getComponentRoot(page);
        await expect(root.getByText('$220.00', { exact: true })).toBeVisible();

        await cashOut(page, '100');

        await Promise.all([
            // The API still shows $220.00: the $100.00 cashed out, fee included, is taken off it.
            expect(root.getByText('$120.00', { exact: true })).toBeVisible(),
            expect(root.getByRole('status')).toContainText("A previous CashOut is still being processed. Try again once it's complete."),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toBeDisabled(),
        ]);
    });

    test('should show what the API shows again once refreshed', async ({ page }) => {
        const root = getComponentRoot(page);
        await cashOut(page, '100');
        await expect(root.getByText('$120.00', { exact: true })).toBeVisible();

        await refreshFromHeader(page);

        await expect(root.getByText('$220.00', { exact: true })).toBeVisible();
    });
});
