import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--rfi-unresponded';

test.describe('Request for information - Unresponded', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render contact support alert for unresponded RFI', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Request for information' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag', { hasText: 'Unresponded' })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(page.getByText('Contact support to respond to this request for information.')).toBeVisible();
        await expect(page.getByText('The response deadline is ')).toBeVisible();
    });
});
