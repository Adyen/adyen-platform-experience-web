import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payment-link-creation--stores-misconfiguration';

test.describe('Payment link creation - Stores misconfiguration', () => {
    test('should display account configuration problem alert when there are no stores', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('New payment link')).toBeVisible();

        const continueButton = page.getByRole('button', { name: 'Continue' });
        await expect(continueButton).toBeDisabled();

        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(page.getByText('Looks like there is a problem with your account configuration.')).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();
    });
});
