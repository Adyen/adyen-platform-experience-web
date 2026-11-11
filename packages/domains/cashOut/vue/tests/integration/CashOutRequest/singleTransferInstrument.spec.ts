import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { waitForCashOutRequest } from '../shared/utils';

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
                // A required field has no indication; only optional fields are marked, with "(optional)".
                expect(root.getByTestId('input-field-label').filter({ hasText: 'Amount to cash out' })).toHaveText('Amount to cash out'),
                // Each value with its label, in the order they are shown. A single bank account is shown as a detail, without a dropdown.
                expect(root.getByRole('term')).toHaveCount(3),
                expect(root.getByRole('term')).toContainText(['Available to cash out', 'Fees', 'Account']),
                expect(root.getByLabel('You can cash out up to your pending balance, subject to a cap per rolling 24-hour period.')).toBeVisible(),
                expect(root.getByLabel('The fee is taken out of the amount you cash out.')).toBeVisible(),
                expect(root.getByRole('definition')).toHaveText(['€1,000.00', '€15.50', 'GB**NWBK**********1234']),
                expect(root.getByRole('combobox', { name: 'Account to deposit into' })).toHaveCount(0),
                expect(root.getByRole('status')).toContainText('You will receive €984.50'),
                expect(root.getByRole('status')).toContainText('The money will be in your account within 30 minutes.'),
                expect(root.getByRole('button', { name: 'Cash out now' })).toBeEnabled(),
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
            { amount: '5000', error: 'Enter an amount up to €1,000.00.' },
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
            await expect(root.getByRole('status')).toContainText('You will receive €984.50');

            const cashOutRequest = waitForCashOutRequest(page);
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
                expect(root.getByRole('heading', { name: 'Instant CashOut request' })).toHaveCount(0),
            ]);
        });
    });
});
