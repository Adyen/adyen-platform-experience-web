import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--not-refundable';

test.describe('Not refundable', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payment transaction without refund button', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeHidden();
    });
});
