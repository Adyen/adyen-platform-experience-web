import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-offer--error-request-funds-generic';

test.describe('Error - Request funds - Generic', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Review offer' }).click();
        await page.getByRole('button', { name: 'Request funds' }).click();
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByText('Business financing summary')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText("We couldn't load financial offers. Try refreshing the page or come back later.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });

    test('should go back to offer selection screen when "Back" button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Go back' }).click();
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('How much money do you need?')).toBeVisible();
    });
});
