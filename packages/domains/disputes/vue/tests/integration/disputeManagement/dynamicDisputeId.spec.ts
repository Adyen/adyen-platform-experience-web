import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--dynamic-dispute-id';

test.describe('Dynamic dispute ID', () => {
    test('should reset flow state and fetch new details when the dispute id changes', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Accept' }).click();
        await expect(page.getByText('By accepting, you agree that the disputed amount will not be returned to your account.')).toBeVisible();

        await page.getByRole('button', { name: 'Switch dispute' }).click();

        await expect(page.getByText('Request for information', { exact: true })).toBeVisible();
        await expect(page.getByText('Contact support to respond to this request for information.')).toBeVisible();
        await expect(page.getByText('By accepting, you agree that the disputed amount will not be returned to your account.')).not.toBeVisible();
    });
});
