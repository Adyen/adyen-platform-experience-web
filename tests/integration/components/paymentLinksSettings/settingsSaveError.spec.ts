import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--settings-save-error';

test.describe('Error - Terms and Conditions Save Error', () => {
    test('Should display error when theme endpoint fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const component = page.locator('div').locator('[class="adyen-pe-component"]');

        await expect(component.getByText('Settings', { exact: true })).toBeVisible();

        const navButton = page.getByRole('button', { name: 'Terms and conditions' });

        await navButton.click();

        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        await expect(page.getByRole('alert')).toBeVisible();
        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });

        await expect(page.getByText('The changes have not been saved. Please try again.')).toBeVisible();
    });
});
