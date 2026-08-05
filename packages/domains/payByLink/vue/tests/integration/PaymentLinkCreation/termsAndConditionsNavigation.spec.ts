import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-creation--default';

test.describe('Payment link creation - Terms and conditions setup', () => {
    test('navigates to terms and conditions settings and restores the selected store on return', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const storeField = page.getByTestId('form-field-store');
        const storeSelect = storeField.getByRole('combobox');

        await storeSelect.click();
        await page.getByRole('option', { name: 'AM001' }).click();

        await expect(page.getByText('Terms and Conditions Setup Required')).toBeVisible();
        await page.getByRole('button', { name: 'Set up Terms and Conditions' }).click();

        await expect(page.getByRole('textbox', { name: 'Your terms and conditions URL' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Theme' })).toHaveCount(0);

        await page.getByRole('button', { name: 'Go back' }).click();

        await expect(storeField).toBeVisible();
        await expect(storeSelect).toHaveText('AM001');
    });
});
