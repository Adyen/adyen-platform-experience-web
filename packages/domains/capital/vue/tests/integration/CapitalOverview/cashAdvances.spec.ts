import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--cash-advances';

test.describe('Cash advances', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render active cash advance', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('£12,000.00 of £20,220.00 fulfilled')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Fulfill your advance', exact: true })).toBeVisible(),
            expect(page.getByText('Term ends:', { exact: false })).toBeHidden(),
        ]);
    });

    test('should render cash advance details', async ({ page }) => {
        await page.getByLabel('Show details').first().click();

        await Promise.all([
            expect(page.getByText('Your requested advance was: £20,000.00')).toBeVisible(),
            expect(page.getByText('Remaining advance amount', { exact: true })).toBeVisible(),
            expect(page.getByText('Remaining advance fees', { exact: true })).toBeVisible(),
            expect(page.getByText('Fulfilled advance amount', { exact: true })).toBeVisible(),
            expect(page.getByText('Fulfilled advance fees', { exact: true })).toBeVisible(),
            expect(page.getByText('Total fulfillment amount', { exact: true })).toBeVisible(),
            expect(page.getByText('Total advance fees', { exact: true })).toBeVisible(),
            expect(page.getByText('Daily earnings deduction', { exact: true })).toBeVisible(),
            expect(page.getByText('Estimated fulfillment period*', { exact: true })).toBeVisible(),
            expect(page.getByText('180 days', { exact: true })).toBeVisible(),
            expect(page.getByText('Advance ID', { exact: true })).toBeVisible(),
            expect(
                page.getByText(
                    '*Estimated fulfillment period is based on your past sales. The actual time period will vary based on your future daily sales.'
                )
            ).toBeVisible(),
            expect(page.getByText('30-day repayment minimum', { exact: true })).toBeHidden(),
            expect(page.getByText('Maximum repayment period', { exact: true })).toBeHidden(),
        ]);
    });

    test('should render cash advance fulfillment details', async ({ page }) => {
        await page.getByRole('button', { name: 'Fulfill your advance', exact: true }).click();

        const repaymentModal = page.getByRole('dialog');
        await Promise.all([
            expect(
                repaymentModal.getByText(
                    'Request to buy back part of your future sales by transferring money to the provided bank account. Payments are recommended to be made from your verified bank accounts.'
                )
            ).toBeVisible(),
            expect(repaymentModal.getByText('How to send a request', { exact: true })).toBeVisible(),
            expect(
                repaymentModal.getByText(
                    'Wait 1-3 business days. We will review your request; If we cannot accept it, we return your transfer to your original bank account or balance account. Your fee and your daily earnings deduction do not change.'
                )
            ).toBeVisible(),
        ]);
    });

    test('should render closed cash advances', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed', exact: true }).click();

        await Promise.all([
            expect(page.getByText('Advance amount', { exact: true })).toHaveCount(4),
            expect(page.getByText('Advance ID', { exact: true })).toHaveCount(4),
            expect(page.getByRole('button', { name: 'Copy advance ID' })).toHaveCount(4),
            expect(page.getByText('Completed', { exact: true })).toBeVisible(),
            expect(page.getByText('Closed', { exact: true }).last()).toBeVisible(),
        ]);
    });

    test('should render the relevant tooltip when completed status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Completed', { exact: true }).hover();

        await expect(page.getByRole('tooltip', { name: 'You have fulfilled the total amount of this advance.' })).toBeVisible();
    });

    test('should render the relevant tooltip when cancelled status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed', exact: true }).click();
        await page.getByText('Canceled', { exact: true }).hover();

        await expect(page.getByRole('tooltip', { name: 'You returned the advance amount, so this advance was canceled.' })).toBeVisible();
    });

    test('should render the relevant tooltip when closed status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed', exact: true }).click();
        await page.getByText('Closed', { exact: true }).last().hover();

        await expect(
            page.getByRole('tooltip', { name: 'This advance has ended. No further amounts will be deducted from your sales.' })
        ).toBeVisible();
    });
});
