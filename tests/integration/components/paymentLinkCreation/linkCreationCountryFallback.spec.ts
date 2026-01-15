import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--country-dataset-fallback';

test.describe('Payment link creation - Country dataset fallback', () => {
    test('Should display country options in English when CDN country dataset fetch fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const continueButton = page.getByRole('button', { name: 'Continuar' });

        // Wait for the form to load - single store setup skips store selection
        await expect(page.locator('input[name="amount.value"]')).toBeVisible();

        await continueButton.click();

        // Step 2: Customer Details - verify country selector has English country names
        // Wait for the customer details form to load
        await expect(page.locator('div[name="countryCode"]')).toBeVisible();

        // Open the country selector
        await page.locator('div[name="countryCode"]').click();

        // Verify that English country names are displayed (fallback from countriesData)
        // These are the countries from the mock COUNTRIES data which has English names
        await expect(page.getByRole('option', { name: 'Spain' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'United States' })).toBeVisible();
    });
});
