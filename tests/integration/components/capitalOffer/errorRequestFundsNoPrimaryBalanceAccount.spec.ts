import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-offer--error-request-funds-no-primary-balance-account';

test.describe('Error - Request funds - No primary balance account', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByTestId('primary-account-warning-icon')).toBeVisible();
        await expect(page.getByText('There is no primary account configured')).toBeVisible();
        await expect(page.getByText("We couldn't continue with the offer. Contact support for help.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Contact support' })).toBeHidden();
    });
});

test.describe('onContactSupport argument', () => {
    test('should render ""Reach out to support" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
        await expect(page.getByRole('button', { name: 'Contact support' })).toBeVisible();
    });
});
