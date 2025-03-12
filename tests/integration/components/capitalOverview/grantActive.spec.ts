import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--grant-active';

test.describe('Grant: Active', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render active grant', async ({ page }) => {
        const amountLabel = page.getByTestId('grant-amount-label').first();
        await expect(amountLabel).toBeVisible();
        await expect(amountLabel).toHaveText('Remaining');

        await expect(page.getByText('€8,220.00').first()).toBeVisible();
        await expect(page.getByText('Term ends: May 16, 2025').first()).toBeVisible();

        const progressBar = page.getByRole('progressbar').first();
        await expect(progressBar).toBeVisible();
        await expect(progressBar).toHaveAttribute('aria-valuenow', '1200000');
        await expect(progressBar).toHaveAttribute('aria-valuemax', '2022000');

        const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();
        await expect(sendRepaymentButton).toBeVisible();
        await expect(sendRepaymentButton).toHaveText('Send repayment');

        await expect(page.getByTestId('expand-button')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeHidden();
    });

    test('should show grant details when button for expanding is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await Promise.all([
            expect(page.getByText('Your requested funds were: €20,000.00')).toBeVisible(),
            expect(page.getByText('Remaining amount')).toBeVisible(),
            expect(page.getByText('€8,130.00')).toBeVisible(),
            expect(page.getByText('Remaining fees')).toBeVisible(),
            expect(page.getByText('€90.00')).toBeVisible(),
            expect(page.getByText('Repaid amount')).toBeVisible(),
            expect(page.getByText('€11,870.00')).toBeVisible(),
            expect(page.getByText('Repaid fees')).toBeVisible(),
            expect(page.getByText('€130.00')).toBeVisible(),
            expect(page.getByText('Daily repayment rate')).toBeVisible(),
            expect(page.getByText('11%')).toBeVisible(),
            expect(page.getByText('Maximum repayment period')).toBeVisible(),
            expect(page.getByText('18 months')).toBeVisible(),
            expect(page.getByText('Expected repayment period')).toBeVisible(),
            expect(page.getByText('365 days (135 days left)')).toBeVisible(),
            expect(page.getByText('Total repayment amount')).toBeVisible(),
            expect(page.getByText('€20,220.00')).toBeVisible(),
            expect(page.getByText('Repayment threshold')).toBeVisible(),
            expect(page.getByText('€800.00')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByText('afedbe0e05e9')).toBeVisible(),
            expect(page.getByText('Account description')).toBeVisible(),
            expect(page.getByText('Primary balance account')).toBeVisible(),
            expect(page.getByText('Account ID')).toBeVisible(),
            expect(page.getByText('BA1234567')).toBeVisible(),
            expect(page.getByTestId('collapse-button')).toBeVisible(),
        ]);
    });

    test('should hide grant details when button for collapsing is clicked', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByTestId('collapse-button').click();
        await expect(page.getByText('Your requested funds were: €20,000.00')).toBeHidden();
    });

    test('should show a tooltip when "Repayment threshold" label is hovered', async ({ page }) => {
        await page.getByTestId('expand-button').click();
        await page.getByText('Repayment threshold').hover();
        await expect(page.getByText('Minimum repayment every 30 days to repay the financing on time')).toBeVisible();
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

            await Promise.all([
                expect(dismissButton).toBeVisible(),
                expect(page.getByText('Send repayment')).toBeVisible(),
                expect(page.getByText('Transfer money to this bank account')).toBeVisible(),
                expect(page.getByText('Bank account details')).toBeVisible(),
                expect(page.getByText('Country/region')).toBeVisible(),
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
