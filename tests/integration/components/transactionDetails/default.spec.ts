import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--default';

test.describe('Default', () => {
    const expectSamePaymentStatusBoxRendering = async (page: Page) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        // Using first here to prevent clashes with other amounts displayed on page
        await expect(page.getByText('607.50 EUR', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('•••• •••• •••• 1945', { exact: true })).toBeVisible();
        await expect(page.getByText('Monday, August 29, 2022 at 09:47 AM GMT-3', { exact: true })).toBeVisible();
    };

    const expectBeforePaymentRefundDetailsRendering = async (page: Page) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        const refundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(refundButton).toBeVisible();
        await expect(refundButton).toBeEnabled();
    };

    const expectAfterPaymentRefundDetailsRendering = async (page: Page) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();

        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(2);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(2);

        const lockedRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(lockedRefundButton).toBeVisible();
        await expect(lockedRefundButton).toBeDisabled();
    };

    const expectSamePaymentDetailsRendering = async (page: Page) => {
        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();

        await expect(page.getByText('Reference ID', { exact: true })).toBeVisible();
        await expect(page.getByText('4B7N9Q2Y6R1W5M8T', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByTestId('copy-icon')).toHaveCount(2);
    };

    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('render', () => {
        test('should render payment transaction details', async ({ page }) => {
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectBeforePaymentRefundDetailsRendering(page);
        });

        test('should switch to payment refund view and back', async ({ page }) => {
            await page.getByRole('button', { name: 'Refund payment', exact: true }).click();
            await expect(page.getByRole('button', { name: 'Refund €133.75', exact: true })).toBeVisible();

            const refundNotice = 'Refunds can take up to 40 days depending on the payment method. Fees are included.';

            await expect(page.getByText(refundNotice, { exact: true })).toBeVisible();
            await expect(page.getByText('Refund payment', { exact: true })).toBeVisible();
            await expect(page.getByText('Reason for refund', { exact: true })).toBeVisible();
            await expect(page.getByText('Requested by customer', { exact: true })).toBeVisible();
            await expect(page.getByText('Amount to refund', { exact: true })).toBeVisible();
            await expect(page.getByText('EUR', { exact: true })).toBeVisible();

            await expect(page.getByText('You can only refund a maximum of €133.75', { exact: true })).toBeVisible();
            await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
            await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

            const amountInput = page.getByLabel('Amount to refund', { exact: true });
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const backButton = page.getByRole('button', { name: 'Go back', exact: true });
            const refundButton = page.getByRole('button', { name: 'Refund €133.75', exact: true });

            await expect(reasonSelect).toBeVisible();
            await expect(reasonSelect).toBeEnabled();

            await expect(amountInput).toBeVisible();
            await expect(amountInput).toBeEnabled();
            await expect(amountInput).toHaveValue('133.75');

            await expect(backButton).toBeVisible();
            await expect(backButton).toBeEnabled();

            await expect(refundButton).toBeVisible();
            await expect(refundButton).toBeEnabled();

            await backButton.click();

            // Back to payment details
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectBeforePaymentRefundDetailsRendering(page);
        });
    });

    test.describe('refund', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole('button', { name: 'Refund payment', exact: true }).click();
            await expect(page.getByRole('button', { name: 'Refund €133.75', exact: true })).toBeVisible();
        });

        test('should select refund reason', async ({ page }) => {
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const refundReasons = ['Requested by customer', 'Issue with item sold', 'Fraudulent', 'Duplicate', 'Other'] as const;
            const refundReasonsCount = refundReasons.length;

            for (let i = refundReasonsCount - 1; i >= 0; i--) {
                await reasonSelect.click();

                const chosenRefundReason = refundReasons[i];
                const dropdownList = page.locator('.adyen-pe-dropdown__list');

                await expect(dropdownList).toBeVisible();
                await expect(dropdownList.getByRole('option')).toHaveCount(refundReasonsCount);

                for (const refundReason of refundReasons) {
                    await expect(dropdownList.getByRole('option', { name: refundReason, exact: true })).toBeVisible();
                }

                await dropdownList.getByRole('option', { name: chosenRefundReason }).click();
                await expect(dropdownList).toBeHidden();

                for (const refundReason of refundReasons) {
                    if (refundReason === chosenRefundReason) {
                        await expect(page.getByText(refundReason, { exact: true })).toBeVisible();
                    } else {
                        await expect(page.getByText(refundReason, { exact: true })).toBeHidden();
                    }
                }
            }
        });

        test('should validate refund amount', async ({ page }) => {
            const amountInput = page.getByLabel('Amount to refund', { exact: true });

            // empty amount
            await amountInput.fill('');
            await expect(amountInput).toHaveValue('');
            await expect(page.getByText('Enter a refund amount')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeDisabled();

            // negative amount
            await amountInput.fill('-10');
            await expect(amountInput).toHaveValue('-10');
            await expect(page.getByText('No negative numbers allowed')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeDisabled();

            // zero amount
            await amountInput.fill('0');
            await expect(amountInput).toHaveValue('0');
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeDisabled();

            // too large amount
            await amountInput.fill('133.76');
            await expect(amountInput).toHaveValue('133.76');
            await expect(page.getByText('You cannot exceed the available amount of €133.75')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment' })).toBeDisabled();

            // excess amount precision is truncated
            await amountInput.fill('133.7599');
            await expect(amountInput).toHaveValue('133.75');
            await expect(page.getByRole('button', { name: 'Refund €133.75' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund €133.75' })).toBeEnabled();

            // integer amount (within limit)
            await amountInput.fill('100');
            await expect(amountInput).toHaveValue('100');
            await expect(page.getByRole('button', { name: 'Refund €100.00' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund €100.00' })).toBeEnabled();
        });

        test('should freeze interactions when refund is in progress', async ({ page }) => {
            const amountInput = page.getByLabel('Amount to refund', { exact: true });
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const refundButton = page.getByRole('button', { name: 'Refund €133.75', exact: true });

            await refundButton.click();

            await expect(refundButton).toBeDisabled();
            await expect(reasonSelect).toBeDisabled();
            await expect(amountInput).toBeDisabled();
            await expect(refundButton).toHaveText('In progress..');
        });

        test('should refund payment', async ({ page }) => {
            await page.getByRole('button', { name: 'Refund €133.75', exact: true }).click();

            const successMessage =
                'Your customer will receive the money in a maximum of 40 days. When the refund is successful you will see a new Refund transaction on your list.';

            await expect(page.getByText(successMessage, { exact: true })).toBeVisible();
            await expect(page.getByText('Refund is sent!', { exact: true })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Go back', exact: true })).toBeVisible();

            await page.getByRole('button', { name: 'Go back' }).click();

            // Return to payment details (refund will be locked)
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectAfterPaymentRefundDetailsRendering(page);
        });
    });
});
