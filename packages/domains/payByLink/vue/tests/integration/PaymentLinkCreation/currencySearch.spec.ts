import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

test('Should filter the amount currency options case-insensitively and select a filtered currency', async ({ page }) => {
    await goToStory(page, { id: STORY_ID });

    // Step 1: Store Selection
    await page.getByTestId('form-field-store').getByRole('combobox').click();
    await page.getByRole('option', { name: 'NY001' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Payment Details — the currency selector is searchable
    const amountField = page.getByTestId('form-field-amount.value');
    await amountField.getByRole('combobox').click();
    await page.getByRole('combobox', { name: 'Amount currency' }).last().fill('usd');

    await expect(page.getByRole('option', { name: 'USD' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'EUR' })).toHaveCount(0);

    await page.getByRole('option', { name: 'USD' }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
});
