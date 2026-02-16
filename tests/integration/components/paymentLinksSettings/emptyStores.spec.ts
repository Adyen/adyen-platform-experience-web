import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--empty-stores';

test.describe('Error - Stores Not Configured', () => {
    test('Should display account configuration problem alert when there are no stores', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const component = page.locator('div').locator('[class="adyen-pe-component"]');

        await expect(component.getByText('Settings', { exact: true })).toBeVisible();

        const saveButton = page.getByRole('button', { name: 'Save' });
        await expect(saveButton).not.toBeVisible();

        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText('Looks like there is a problem with your account configuration.')).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();
    });
});
