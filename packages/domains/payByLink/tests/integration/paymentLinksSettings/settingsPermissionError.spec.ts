import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--settings-role-not-assigned';

test.describe('Error - PBL Settings role not assigned', () => {
    test('Should display error when the user does not have the correct role to render settings', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const errorText = page.getByText('Something went wrong.');

        await expect(errorText.first()).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();
    });
});
