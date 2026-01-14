import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--repayment-no-transfer-instruments';

test.describe('Repayment - No transfer instruments', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render send repayment button', async ({ page }) => {
        const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();

        await Promise.all([
            // send repayment button is visible
            expect(sendRepaymentButton).toBeVisible(),
            expect(sendRepaymentButton).toHaveText('Send repayment'),
        ]);
    });

    test.describe('Send repayment view', () => {
        test.beforeEach(async ({ page }) => {
            const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();

            // switching to send repayment view
            await sendRepaymentButton.click();
            await sendRepaymentButton.waitFor({ state: 'detached' });
        });

        test('should show repayment details after "Send repayment" button is clicked', async ({ page }) => {
            const dismissButton = page.getByRole('button', { name: 'Dismiss', exact: true }).first();
            const copyIconButtons = page.getByTestId('copyText');

            await Promise.all([
                expect(dismissButton).toBeVisible(),
                expect(page.getByText('Send repayment')).toBeVisible(),
                expect(page.getByText('Pay off your loan faster by making one-time payments.')).toBeVisible(),
                expect(page.getByText('Loan repayment bank account')).toBeVisible(),
                expect(copyIconButtons).toHaveCount(2),
                expect(page.getByText('IBAN')).toBeVisible(),
                expect(page.getByText('NL69 RABO 1319 7782 91')).toBeVisible(),
                expect(page.getByText('Account owned by')).toBeVisible(),
                expect(page.getByText('Adyen N.V.', { exact: true }).first()).toBeVisible(),
                expect(page.getByText('Country/region')).toBeVisible(),
                expect(page.getByText('NL', { exact: true })).toBeVisible(),
                expect(page.getByText('Your verified bank accounts')).not.toBeVisible(),
                expect(page.getByText('How to send a loan payment')).toBeVisible(),
                expect(page.getByText('Add Adyen N.V. as a payee using your bank’s website or app.')).toBeVisible(),
                expect(page.getByText('Send your payment.')).toBeVisible(),
                expect(page.getByText('Wait 1-3 business days for the payment to be applied to your loan.')).toBeVisible(),
                expect(page.getByText('Payments made from a verified account are usually applied faster.')).toBeVisible(),
            ]);
        });
    });
});
