import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--refund-locked';

test.describe('Refund - Locked', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payment transaction with disabled refund button', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();

        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(2);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(2);

        const disabledRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(disabledRefundButton).toBeVisible();
        await expect(disabledRefundButton).toBeDisabled();
    });
});
