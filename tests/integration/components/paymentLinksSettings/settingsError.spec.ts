import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--settings-error';

test.describe('Error - Terms and Conditions Error', () => {
    test('Should display error when theme endpoint fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const component = page.locator('div').locator('[class="adyen-pe-component"]');

        await expect(component.getByText('Settings', { exact: true })).toBeVisible();

        const navButton = page.getByRole('button', { name: 'Terms and conditions' });

        await navButton.click();

        const saveButton = page.getByRole('button', { name: 'Save' });
        await expect(saveButton).not.toBeVisible();

        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText('We couldn’t load your payment links terms and conditions URL.')).toBeVisible();
        await expect(page.getByText('Contact support for help and share error code')).toBeVisible();

        const refreshButton = page.getByRole('button', { name: 'Refresh' });
        await expect(refreshButton).toBeVisible();
    });
});
