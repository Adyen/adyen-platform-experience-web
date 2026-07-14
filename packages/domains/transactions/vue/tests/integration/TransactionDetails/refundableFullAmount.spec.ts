import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionDetails';

const STORY_ID = 'mocked-transactions-transaction-details--refundable-full-amount';

test.describe('Refundable - Full amount', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render payment transaction', async ({ page }) => {
        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        await expect(page.getByRole('status')).toHaveCount(0);
        await expect(page.getByRole('alert')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false })).toBeVisible();
    });

    test('should only allow to refund full payment amount', async ({ page }) => {
        await page.getByRole('button', { name: 'Refund payment', exact: true, disabled: false }).click();

        // [TODO]: Address missing ARIA label association with spinbutton (number input)
        const amountInput = page.getByRole('spinbutton', { /*name: 'Amount to refund', exact: true,*/ disabled: true });
        const refundButton = page.getByRole('button', { name: 'Refund €607.50', exact: true, disabled: false });

        await expect(amountInput).toBeVisible();
        await expect(amountInput).toHaveValue('607.50');
        await expect(refundButton).toBeVisible();

        await expect(page.getByText('EUR', { exact: true })).toBeVisible();
        await expect(page.getByText('You can only refund €607.50', { exact: true })).toBeVisible();
        await expect(page.getByRole('status')).toHaveCount(1);

        await refundButton.click();
        await expect(page.getByText('Refund is sent!', { exact: true })).toBeVisible();

        await page.getByRole('button', { name: 'Go back', exact: true, disabled: false }).click();

        await expect(page.getByText('Payment', { exact: true })).toBeVisible();
        // [TODO]: Address amount formatting discrepancy (use currency code instead of symbol)
        // await expect(page.getByText('607.50 EUR', { exact: true })).toBeVisible();
        await expect(page.getByText('€607.50', { exact: true })).toBeVisible();

        await expect(page.getByText('The refund is being processed. Please come back later.', { exact: true })).toBeVisible();
        await expect(page.getByRole('status')).toHaveCount(1);
        await expect(page.getByRole('alert')).toHaveCount(0);

        const lockedRefundButton = page.getByRole('button', { name: 'Refund payment', exact: true, disabled: true });
        await expect(lockedRefundButton).toBeVisible();
    });
});
