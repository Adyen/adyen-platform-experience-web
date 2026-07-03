import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

test.describe('Payment link creation - Stepper navigation', () => {
    test('Blocks steps ahead of an incomplete step and navigates to completed steps on click', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const storeStep = page.getByRole('button', { name: 'Store', exact: true });
        const paymentStep = page.getByRole('button', { name: 'Payment', exact: true });
        const continueButton = page.getByRole('button', { name: 'Continue' });

        // The store step is not completed yet, so later steps must stay blocked.
        await expect(page.getByTestId('form-field-store')).toBeVisible();
        await expect(paymentStep).toBeDisabled();

        // Complete the store step and advance to the payment step.
        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'NY001' }).click();
        await continueButton.click();

        // We are now on the payment step (store field no longer rendered).
        await expect(page.getByTestId('form-field-amount.value')).toBeVisible();
        await expect(page.getByTestId('form-field-store')).toBeHidden();

        // Clicking a completed step takes us back to that step.
        await storeStep.click();
        await expect(page.getByTestId('form-field-store')).toBeVisible();
        await expect(page.getByTestId('form-field-amount.value')).toBeHidden();
    });
});
