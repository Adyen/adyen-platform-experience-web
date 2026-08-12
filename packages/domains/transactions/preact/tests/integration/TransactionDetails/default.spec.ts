import type { Page } from '@playwright/test';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getClipboardContent, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedAnalyticsEventProperties, sharedCopyButtonAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionDetails';

const STORY_ID = 'mocked-transactions-transaction-details--default';

test.describe('Default', () => {
    const expectSamePaymentStatusBoxRendering = async (page: Page) => {
        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        await expect(page.getByText('Partially refunded', { exact: true })).toBeVisible();

        // Using first here to prevent clashes with other amounts displayed on page
        await expect(page.getByText('607.50 EUR', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('•••• •••• •••• 1945', { exact: true })).toBeVisible();
        await expect(page.getByText('Monday, August 29, 2022 at 09:47 AM GMT-3', { exact: true })).toBeVisible();
    };

    const expectBeforePaymentRefundDetailsRendering = async (page: Page) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByRole('alert')).toHaveCount(1);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false })).toBeVisible();
    };

    const expectAfterPaymentRefundDetailsRendering = async (page: Page) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();
        await expect(page.getByRole('alert')).toHaveCount(2);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true })).toBeVisible();
    };

    const expectSamePaymentDetailsRendering = async (page: Page) => {
        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();

        await expect(page.getByText('Reference ID', { exact: true })).toBeVisible();
        await expect(page.getByText('4B7N9Q2Y6R1W5M8T', { exact: true })).toBeVisible();

        await expect(page.getByText('Merchant reference', { exact: true })).toBeVisible();
        await expect(page.getByText('TX-F9X2V8L7P1K6W', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByTestId('copy-icon')).toHaveCount(3);
    };

    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test.describe('render', () => {
        test('should render payment transaction details', async ({ page }) => {
            await expect(page.getByText('Transaction details', { exact: true })).toHaveCount(1);
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectBeforePaymentRefundDetailsRendering(page);
        });

        test('should copy transaction details', async ({ page, context, analyticsEvents }) => {
            // Grant clipboard permissions to browser context
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            const copyButtons = [
                { name: 'Copy reference ID', subSectionName: 'Reference ID', value: '4B7N9Q2Y6R1W5M8T' },
                { name: 'Copy merchant reference', subSectionName: 'Merchant reference', value: 'TX-F9X2V8L7P1K6W' },
                { name: 'Copy PSP reference', subSectionName: 'PSP reference', value: 'PSP0000000000990' },
            ];

            for (const { name, subSectionName, value } of copyButtons) {
                await page.getByRole('button', { name, exact: true, disabled: false }).click();
                await expect(page.getByText('Copied', { exact: true })).toBeVisible();

                await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...sharedCopyButtonAnalyticsEventProperties, subSectionName }]]);

                const copiedValue = await getClipboardContent(page);
                expect(copiedValue).toBe(value);
            }
        });

        test('should switch to payment refund view and back', async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Switched to refund view', sharedAnalyticsEventProperties]]);

            const refundNotice = 'Refunds can take up to 40 days depending on the payment method. Fees are included.';

            await expect(page.getByText(refundNotice, { exact: true })).toBeVisible();
            await expect(page.getByText('Refund payment', { exact: true })).toBeVisible();
            await expect(page.getByText('Reason for refund', { exact: true })).toBeVisible();
            await expect(page.getByText('Requested by customer', { exact: true })).toBeVisible();
            await expect(page.getByText('Amount to refund', { exact: true })).toBeVisible();
            await expect(page.getByText('EUR', { exact: true })).toBeVisible();

            await expect(page.getByText('You can only refund a maximum of €133.75', { exact: true })).toBeVisible();
            await expect(page.getByRole('alert')).toHaveCount(1);

            const amountInput = page.getByLabel('Amount to refund', { exact: true });
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const backButton = page.getByRole('button', { name: 'Go back', exact: true, disabled: false });
            const refundButton = page.getByRole('button', { name: 'Refund €133.75', exact: true, disabled: false });

            await expect(reasonSelect).toBeVisible();
            await expect(reasonSelect).toBeEnabled();

            await expect(amountInput).toBeVisible();
            await expect(amountInput).toBeEnabled();
            await expect(amountInput).toHaveValue('133.75');

            await expect(backButton).toBeVisible();
            await expect(refundButton).toBeVisible();

            await backButton.click();
            await expectAnalyticsEvents(analyticsEvents, [['Cancelled refund', sharedAnalyticsEventProperties]]);

            // Back to payment details
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectBeforePaymentRefundDetailsRendering(page);
        });
    });

    test.describe('refund', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Switched to refund view', sharedAnalyticsEventProperties]]);
        });

        test('should select refund reason', async ({ page }) => {
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const refundReasons = ['Requested by customer', 'Issue with item sold', 'Fraudulent', 'Duplicate', 'Other'] as const;
            const refundReasonsCount = refundReasons.length;

            for (let i = refundReasonsCount - 1; i >= 0; i--) {
                await reasonSelect.click();

                const chosenRefundReason = refundReasons[i];
                const dropdownList = page.getByRole('listbox');

                await expect(dropdownList).toBeVisible();
                await expect(dropdownList.getByRole('option')).toHaveCount(refundReasonsCount);

                for (const refundReason of refundReasons) {
                    await expect(dropdownList.getByRole('option', { name: refundReason, exact: true })).toBeVisible();
                }

                await dropdownList.getByRole('option', { name: chosenRefundReason, disabled: false }).click();
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
            await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true })).toBeVisible();

            // negative amount
            await amountInput.fill('-10');
            await expect(amountInput).toHaveValue('-10');
            await expect(page.getByText('No negative numbers allowed')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true })).toBeVisible();

            // zero amount
            await amountInput.fill('0');
            await expect(amountInput).toHaveValue('0');
            await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true })).toBeVisible();

            // too large amount
            await amountInput.fill('133.76');
            await expect(amountInput).toHaveValue('133.76');
            await expect(page.getByText('You cannot exceed the available amount of €133.75')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true })).toBeVisible();

            // excess amount precision is truncated
            await amountInput.fill('133.7599');
            await expect(amountInput).toHaveValue('133.75');
            await expect(page.getByRole('button', { name: 'Refund €133.75', exact: true, disabled: false })).toBeVisible();

            // integer amount (within limit)
            await amountInput.fill('100');
            await expect(amountInput).toHaveValue('100');
            await expect(page.getByRole('button', { name: 'Refund €100.00', exact: true, disabled: false })).toBeVisible();
        });

        test('should freeze interactions when refund is in progress', async ({ page }) => {
            const amountInput = page.getByLabel('Amount to refund', { exact: true });
            const reasonSelect = page.getByLabel('Reason for refund', { exact: true });
            const refundButton = page.getByRole('button', { name: 'Refund €133.75', exact: true });

            await expect(amountInput).toBeEnabled();
            await expect(reasonSelect).toBeEnabled();
            await expect(refundButton).toBeEnabled();

            await refundButton.click();

            await expect(amountInput).toBeDisabled();
            await expect(reasonSelect).toBeDisabled();
            await expect(refundButton).toBeDisabled();
            await expect(refundButton).toHaveText('In progress..');
        });

        test('should refund payment', async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Refund €133.75', exact: true, disabled: false }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Completed refund', sharedAnalyticsEventProperties]]);

            const successMessage =
                'Your customer will receive the money in a maximum of 40 days. When the refund is successful you will see a new Refund transaction on your list.';

            await expect(page.getByText(successMessage, { exact: true })).toBeVisible();
            await expect(page.getByText('Refund is sent!', { exact: true })).toBeVisible();

            const backButton = page.getByRole('button', { name: 'Go back', exact: true, disabled: false });

            await expect(backButton).toBeVisible();
            await backButton.click();

            // Return to payment details (refund will be locked)
            await expectSamePaymentStatusBoxRendering(page);
            await expectSamePaymentDetailsRendering(page);
            await expectAfterPaymentRefundDetailsRendering(page);
        });
    });
});
