import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transactions-transaction-details--refunded-partially';

test.describe('Refunded - Partially', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render partially refunded payment transaction', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeVisible();
    });
});
