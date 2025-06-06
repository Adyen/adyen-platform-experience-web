import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-dispute-management--rfi-acceptable';

test.describe('Request for information - Acceptable', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should complete the accept flow for request for information type', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Request for information' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag', { hasText: 'Unresponded' })).toBeVisible();

        await expect(page.getByText('Contact support to respond to this request for information.')).toBeVisible();

        await page.getByRole('button', { name: 'Accept' }).click();

        await expect(page.getByText('Accept request for information')).toBeVisible();
        await expect(page.getByText('By accepting, you agree that the request for information might become a dispute charge.')).toBeVisible();
        await page.getByText('I agree').click();

        await page.getByRole('button', { name: 'Accept' }).click();

        await expect(page.getByText('Request for information has been accepted')).toBeVisible();
        await page.getByRole('button', { name: 'Show details' }).click();
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Request for information' })).toBeVisible();
    });
});
