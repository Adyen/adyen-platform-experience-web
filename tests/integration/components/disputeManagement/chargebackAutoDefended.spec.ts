import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-auto-defended';

test.describe('Chargeback - Auto defended', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render chargeback auto-defended alert message if defended automatically', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Chargeback' })).toBeVisible();
        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor({ state: 'visible' });
        await expect(icon).toBeVisible();

        await expect(page.getByText('This chargeback was defended automatically.')).toBeVisible();
    });
});
