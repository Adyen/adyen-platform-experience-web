import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--cash-out-error';

test.describe('CashOut Overview - Error - Cash out', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await getComponentRoot(page).getByRole('button', { name: 'Start instant CashOut' }).click();

        const modal = page.getByRole('dialog', { name: 'Instant CashOut request' });
        await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await modal.getByRole('option', { name: 'NL91 **** **** 4300' }).click();
        await modal.getByRole('button', { name: 'Cash out now' }).click();
    });

    test('should show the error screen instead of the form', async ({ page }) => {
        const modal = page.getByRole('dialog', { name: 'Instant CashOut request' });

        await Promise.all([
            expect(modal.getByRole('alert')).toContainText('Something went wrong.'),
            expect(modal.getByRole('alert')).toContainText('Please try again.'),
            expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
            // Only the close button of the modal: the request in the modal has no close button of its own.
            expect(modal.getByRole('button', { name: 'Close' })).toHaveCount(1),
        ]);
    });

    test('should keep what is available to cash out once the request is closed', async ({ page }) => {
        const modal = page.getByRole('dialog', { name: 'Instant CashOut request' });

        await modal.getByRole('button', { name: 'Close' }).click();

        await expect(modal).toBeHidden();
        await expect(getComponentRoot(page).getByText('$220.00', { exact: true })).toBeVisible();
    });
});
