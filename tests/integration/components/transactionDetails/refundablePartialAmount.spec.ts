import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transactions-transaction-details--refundable-partial-amount';

test.describe('Refundable - Partial amount', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payment transaction', async ({ page }) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeVisible();
    });

    test('should allow to refund partial payment amount', async ({ page }) => {
        await page.getByRole('button', { name: 'Refund payment', exact: true }).click();

        const amountInput = page.getByLabel('Amount to refund', { exact: true });

        await expect(amountInput).toBeVisible();
        await expect(amountInput).toBeEnabled();
        await expect(amountInput).toHaveValue('607.50');

        await expect(page.getByText('EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('You can only refund a maximum of €607.50', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        await amountInput.fill('100');
        await expect(amountInput).toHaveValue('100');

        const refundButton = page.getByRole('button', { name: 'Refund €100.00', exact: true });

        await expect(refundButton).toBeVisible();
        await expect(refundButton).toBeEnabled();

        await refundButton.click();
        await expect(page.getByText('Refund is sent!', { exact: true })).toBeVisible();

        await page.getByRole('button', { name: 'Go back', exact: true }).click();

        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(1);
        await expect(page.getByText('607.50 EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        const lockedRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(lockedRefundButton).toBeVisible();
        await expect(lockedRefundButton).toBeDisabled();
    });
});
