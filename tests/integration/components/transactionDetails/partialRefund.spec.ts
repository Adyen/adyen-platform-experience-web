import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--partial-refund';

test.describe('Partial refund', () => {
    const expectExactRefundDetailsRendering = async (page: Page) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Refund' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partial' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        await expect(page.getByText('- 473.75 EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();

        await expect(page.getByText('Reason for refund', { exact: true })).toBeVisible();
        await expect(page.getByText('Requested by customer', { exact: true })).toBeVisible();

        await expect(page.getByText('Reference ID', { exact: true })).toBeVisible();
        await expect(page.getByText('4B7N9Q2Y6R1W5M8T', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByText('Refund PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000999', { exact: true })).toBeVisible();

        await expect(page.getByTestId('copy-icon')).toHaveCount(2);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(0);

        await expect(page.getByRole('button', { name: 'Go back', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Go to payment', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Return to refund', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeHidden();
    };

    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render partial refund transaction', async ({ page }) => {
        await expectExactRefundDetailsRendering(page);
    });

    test('should go to original payment transaction', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to payment', exact: true }).click();

        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        await expect(page.getByText('607.50 EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();

        await expect(page.getByText('Reference ID', { exact: true })).toBeVisible();
        await expect(page.getByText('W9R2T6M4L1P7V8X5', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByTestId('copy-icon')).toHaveCount(2);

        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        await expect(page.getByRole('button', { name: 'Go back', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Go to payment', exact: true })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Return to refund', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toBeVisible();
    });

    test('should return back to refund from original payment', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to payment', exact: true }).click();
        await page.getByRole('button', { name: 'Return to refund', exact: true }).click();
        await expectExactRefundDetailsRendering(page);
    });
});
