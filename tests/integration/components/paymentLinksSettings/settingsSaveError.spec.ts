import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--settings-save-error';

test.describe('Error - Terms and Conditions Save Error', () => {
    test('Should display error when saving terms and conditions fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const component = page.locator('div').locator('[class="adyen-pe-component"]');

        await expect(component.getByText('Settings', { exact: true })).toBeVisible();

        const navButton = page.getByRole('button', { name: 'Terms and conditions' });

        await navButton.click();

        const termsAndConditionsInput = page.getByRole('textbox', { name: 'Your terms and conditions URL' });
        await termsAndConditionsInput.fill('https://example.com/terms');
        await termsAndConditionsInput.fill('https://example.com/term');
        await page.getByRole('button', { name: 'all requirements.' }).click();
        await expect(page.getByText('Terms and conditions requirements for Pay by Link')).toBeVisible();
        await page.getByRole('button', { name: 'Confirm requirements' }).click();

        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        await expect(page.getByText('The changes have not been saved. Please try again.')).toBeVisible();
    });
});
