import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--rfi-expired';

test.describe('Request for information - Expired', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render expired alert message for expired RFI', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Request for information' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Expired' })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(page.getByText('This request for information wasn’t responded to and was lost by default.')).toBeVisible();
    });
});
