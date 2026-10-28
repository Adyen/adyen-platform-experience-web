import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--single-transfer-instrument';

test.describe('CashOut Request - Single transfer instrument', () => {
    test.describe('Render', () => {
        test.beforeEach(async ({ page }) => {
            await goToStory(page, { id: STORY_ID });
        });

        test('should offer to cash out all that is available to the only bank account', async ({ page }) => {
            const root = getComponentRoot(page);

            await Promise.all([
                expect(root.getByRole('heading', { name: 'Instant CashOut request' })).toBeVisible(),
                expect(root.getByRole('combobox', { name: 'Balance account' })).toHaveText('S. Hopper - Main Account'),
                expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('1000.00'),
                expect(root.getByRole('definition').filter({ hasText: '€1,000.00 EUR' })).toBeVisible(),
                expect(root.getByRole('definition').filter({ hasText: '€15.50 EUR' })).toBeVisible(),
                // A single bank account is shown as a detail, without a dropdown.
                expect(root.getByRole('definition').filter({ hasText: '•••• 1234' })).toBeVisible(),
                expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveCount(0),
                expect(root.getByRole('status')).toContainText('You will receive €984.50 EUR'),
                expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled(),
                expect(root.getByRole('button', { name: 'Cancel' })).toBeEnabled(),
            ]);
        });
    });

    test.describe('Amount validation', () => {
        test.beforeEach(async ({ page }) => {
            await goToStory(page, { id: STORY_ID });
        });

        const amountCases = [
            { amount: '', error: 'Enter an amount to cash out.' },
            { amount: '0', error: 'Enter an amount greater than 0.' },
            { amount: '5000', error: 'Enter an amount up to €1,000.00 EUR.' },
        ];

        for (const { amount, error } of amountCases) {
            test(`should not offer to cash out ${amount ? amount : 'without an amount'}`, async ({ page }) => {
                const root = getComponentRoot(page);
                const amountField = root.getByRole('spinbutton', { name: 'Amount to cash out' });

                await amountField.fill(amount);
                await amountField.blur();

                await Promise.all([
                    expect(root.getByText(error)).toBeVisible(),
                    expect(root.getByRole('status')).toHaveCount(0),
                    expect(root.getByRole('button', { name: 'Cash out now' })).toBeDisabled(),
                ]);
            });
        }
    });

    test.describe('Cash out', () => {
        test('should send the cashOut, with the reference and the description given by the integration, and show it succeeded', async ({ page }) => {
            await goToStory(page, { id: STORY_ID, args: { referenceForBeneficiary: 'REF123', transferDescription: 'Weekly' } });
            const root = getComponentRoot(page);
            await expect(root.getByRole('status')).toContainText('You will receive €984.50 EUR');

            const cashOutRequest = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/cashout'));
            await root.getByRole('button', { name: 'Cash out now' }).click();

            expect((await cashOutRequest).postDataJSON()).toEqual({
                amount: 100000,
                currency: 'EUR',
                counterparty: { transferInstrumentId: 'SE322KT223222F5GXZFNM4C6K' },
                description: 'Weekly',
                referenceForBeneficiary: 'REF123',
            });
            await Promise.all([
                expect(root.getByText('CashOut successful')).toBeVisible(),
                expect(root.getByText('You can expect your money to be in your account within 30 minutes.')).toBeVisible(),
                expect(root.getByRole('button', { name: 'Close' })).toBeVisible(),
                expect(root.getByRole('heading', { name: 'Instant CashOut request' })).toHaveCount(0),
            ]);
        });
    });

    test.describe('onDismiss', () => {
        test('should not offer to cancel, or to close once cashed out, without onDismiss', async ({ page }) => {
            await goToStory(page, { id: STORY_ID, args: { onDismiss: 'Disabled' } });
            const root = getComponentRoot(page);

            await expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled();
            await expect(root.getByRole('button', { name: 'Cancel' })).toHaveCount(0);

            await root.getByRole('button', { name: 'Cash out now' }).click();

            await expect(root.getByText('CashOut successful')).toBeVisible();
            await expect(root.getByRole('button', { name: 'Close' })).toHaveCount(0);
        });
    });
});
