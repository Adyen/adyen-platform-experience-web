import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--themes-save-error';

test.describe('Error - Theme Save Error', () => {
    test('Should display error when theme endpoint fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const component = page.locator('div').locator('[class="adyen-pe-component"]');

        await expect(component.getByText('Settings', { exact: true })).toBeVisible();

        const brandInput = page.getByRole('textbox', { name: 'Brand name' });
        await brandInput.fill('Test brand name');

        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page.locator('.adyen-pe-alert__icon')).toBeVisible();

        await expect(page.getByText('The changes have not been saved. Please try again.')).toBeVisible();
    });
});
