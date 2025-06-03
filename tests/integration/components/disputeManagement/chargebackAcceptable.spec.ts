import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-dispute-management--chargeback-acceptable';

test.describe('Chargeback - Acceptable', () => {
    test('should render acceptable chargeback ', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Chargeback' })).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(page.getByText('Contact support to defend this dispute.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Defend chargeback' })).not.toBeVisible();
    });

    test('should contact support button', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Contact support' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Defend chargeback' })).not.toBeVisible();
    });
});
