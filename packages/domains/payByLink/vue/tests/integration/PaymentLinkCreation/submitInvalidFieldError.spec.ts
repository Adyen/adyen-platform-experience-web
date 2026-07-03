import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--submit-invalid-field-error';

test.describe('Payment link creation - Submit invalid fields', () => {
    test('Should show invalid fields message when submit returns invalid fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const continueButton = page.getByRole('button', { name: 'Continue' });
        const createPaymentLinkButton = page.getByRole('button', { name: 'Create payment link' });

        // Step 1: Store selection
        await page.getByTestId('form-field-store').getByRole('combobox').click();
        await page.getByRole('option', { name: 'NY001' }).click();

        // Prefilled fields let us advance straight through to the summary
        await continueButton.click();
        await continueButton.click();
        await continueButton.click();

        await expect(createPaymentLinkButton).toBeVisible();
        await createPaymentLinkButton.click();

        await expect(page.getByText('We cannot create a payment link because these fields are invalid:')).toBeVisible();
        await expect(page.getByText('Amount', { exact: true })).toBeVisible();
    });
});
