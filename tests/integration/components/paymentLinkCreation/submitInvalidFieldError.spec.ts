import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--submit-invalid-field-error';

test.describe('Payment link creation - Submit invalid fields', () => {
    test('Should show invalid fields message when submit returns invalid fields', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const continueButton = page.getByRole('button', { name: 'Continue' });
        const createPaymentLinkButton = page.getByRole('button', { name: 'Create payment link' });

        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();

        await continueButton.click();
        await continueButton.click();
        await continueButton.click();

        await expect(createPaymentLinkButton).toBeVisible();
        await createPaymentLinkButton.click();

        const alert = page.getByRole('alert').nth(1);
        await expect(alert).toBeVisible();
        await expect(alert).toContainText('We cannot create a payment link because these fields are invalid:');
        await expect(alert).toContainText('Amount');
    });
});
