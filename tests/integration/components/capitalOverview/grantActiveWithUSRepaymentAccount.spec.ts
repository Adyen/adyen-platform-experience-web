import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--grant-active-with-us-repayment-account';

test.describe('Grant: Active - With US repayment account', () => {
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
                expect(page.getByText('Transfer money to this bank account')).toBeVisible(),
                expect(page.getByText('Bank account details')).toBeVisible(),
                expect(copyIconButtons).toHaveCount(2),
                expect(page.getByText('Account number')).toBeVisible(),
                expect(page.getByText('123456789012', { exact: true })).toBeVisible(),
                expect(page.getByText('Routing number')).toBeVisible(),
                expect(page.getByText('012345678', { exact: true })).toBeVisible(),
                expect(page.getByText('Country/region')).toBeVisible(),
                expect(page.getByText('US', { exact: true })).toBeVisible(),
                expect(page.getByText('repayment bank transfer made towards your loan')).toBeVisible(),
                expect(page.getByText('current remaining amount, including fees')).toBeVisible(),
                expect(page.getByText('€8,220.00')).toBeVisible(),
            ]);
        });

        test('should return to grants list when send repayment dismiss button is clicked', async ({ page }) => {
            const dismissButton = page.getByRole('button', { name: 'Dismiss', exact: true }).first();

            // closing send repayment view
            await dismissButton.click();
            await dismissButton.waitFor({ state: 'detached' });

            // showing active grants list view
            const amountLabel = page.getByTestId('grant-amount-label').first();
            const progressBar = page.getByRole('progressbar').first();
            const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();
            const grantExpandButton = page.getByTestId('expand-button');

            await Promise.all([
                expect(amountLabel).toBeVisible(),
                expect(progressBar).toBeVisible(),
                expect(sendRepaymentButton).toBeVisible(),
                expect(grantExpandButton).toBeVisible(),
            ]);
        });
    });
});
