import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-offer--error-request-funds-generic-with-code';

test.describe('Error - Request funds - Generic with code', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByText('Business financing summary')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(
            page.getByText("We couldn't continue with the offer. Contact support for help and share error code 226ac4ce59f0f159ad672d38d3291e93")
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to offer selection screen when "Back" button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('How much money do you need?')).toBeVisible();
    });
});

test.describe('"onContactSupport" prop', () => {
    test('should render ""Reach out to support"" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });

    test('should not render ""Reach out to support"" button when unset', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});
