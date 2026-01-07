import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payment-link-creation--configuration-error';

test.describe('Payment link creation - Configuration error', () => {
    test('Should show error message if configuration endpoint fails', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('New payment link')).toBeVisible();

        await page.getByRole('button', { name: 'Select option' }).click();
        await page.getByRole('option', { name: 'NY001' }).click();

        const continueButton = page.getByRole('button', { name: 'Continue' });
        await continueButton.click();

        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText('We couldn’t load the page.')).toBeVisible();
        await expect(page.getByText('Try refreshing the page or come back later.')).toBeVisible();
        await expect(continueButton).toBeDisabled();
    });
});
