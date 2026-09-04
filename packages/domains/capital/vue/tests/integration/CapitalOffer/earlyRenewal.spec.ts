import { test, expect, type Page } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--early-renewal';

const goToOfferSummary = async (page: Page) => {
    await page.getByRole('button', { name: 'Review request' }).click();
};

test.describe('Early renewal', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render early renewal info in offer selection screen', async ({ page }) => {
        const newLoanField = page.getByText('New loan').locator('..');
        const currentLoanBalanceField = page.getByText('Current loan balance').locator('..');
        const amountToReceiveField = page.getByText("Amount you'll receive").locator('..');

        await Promise.all([
            expect(newLoanField).toBeVisible(),
            expect(newLoanField.getByText('€18,600')).toBeVisible(),
            expect(currentLoanBalanceField).toBeVisible(),
            expect(currentLoanBalanceField.getByText('€8,130')).toBeVisible(),
            expect(amountToReceiveField).toBeVisible(),
            expect(amountToReceiveField.getByText('€10,470')).toBeVisible(),
        ]);
    });

    test('should render early renewal info in offer summary screen', async ({ page }) => {
        await goToOfferSummary(page);
        await expect(page.getByText('Business financing summary')).toBeVisible();
        await expect(page.getByText('New loan', { exact: true })).toHaveCount(2);
        await expect(page.getByText('-', { exact: true })).toBeVisible();
        await expect(page.getByText('Current loan balance')).toBeVisible();
        await expect(page.getByText('€8,130')).toBeVisible();
        await expect(page.getByText('=')).toBeVisible();
        await expect(page.getByText("Amount you'll receive")).toBeVisible();
        await expect(page.getByText('€10,470')).toBeVisible();
        await expect(page.getByRole('tab', { name: 'New loan' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Current loan' })).toBeVisible();
        await expect(page.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(page.getByText('€18,600.00')).toBeVisible();
        await expect(page.getByText('Fees', { exact: true })).toHaveCount(2);
        await expect(page.getByText('€2,046.00')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toHaveCount(2);
        await expect(page.getByText('€20,646.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toHaveCount(1);
        await expect(page.getByText('11%')).toBeVisible();
        await expect(page.getByText('30-day repayment minimum')).toHaveCount(1);
        await expect(page.getByText('€3,441.00')).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toHaveCount(1);
        await expect(page.getByText('6 months')).toBeVisible();
        await expect(page.getByText('Maximum repayment date')).toHaveCount(1);
        await expect(page.getByText('Sep 28, 2025')).toBeVisible();
        await expect(page.getByText('Account', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Primary account')).toHaveCount(1);
        await expect(
            page.getByText(
                'The terms and conditions of a new loan are separate from those of your existing loan, including, but not limited to, the repayment schedule, fees, and other material provisions. Carefully review all documentation associated with this new loan before accepting it.'
            )
        ).toBeVisible();
        await expect(
            page.getByText(
                'You may choose to retain your existing loan under its current terms. If you accept the new loan, a portion of the new amount will be applied to payoff your current loan. Your existing loan will be Repaid in accordance with its terms.'
            )
        ).toBeVisible();
    });

    test('should switch to new loan tab when the latter is clicked', async ({ page }) => {
        await goToOfferSummary(page);
        await page.getByRole('tab', { name: 'Current loan' }).click();
        await page.getByRole('tab', { name: 'New loan' }).click();
        await expect(page.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(page.getByText('€18,600.00')).toBeVisible();
    });

    test('should switch to current loan tab when the latter is clicked', async ({ page }) => {
        await goToOfferSummary(page);
        await page.getByRole('tab', { name: 'Current loan' }).click();
        await expect(page.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Fees', { exact: true })).toHaveCount(2);
        await expect(page.getByText('€220.00')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toHaveCount(2);
        await expect(page.getByText('€20,220.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toHaveCount(1);
        await expect(page.getByText('15%')).toBeVisible();
        await expect(page.getByText('30-day repayment minimum')).toHaveCount(1);
        await expect(page.getByText('€800.00')).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toHaveCount(1);
        await expect(page.getByText('12 months')).toBeVisible();
        await expect(page.getByText('Maximum repayment date')).toHaveCount(1);
        await expect(page.getByText('Mar 27, 2026')).toBeVisible();
        await expect(page.getByText('Account', { exact: true })).toHaveCount(1);
        await expect(page.getByText('Primary account')).toHaveCount(1);
    });
});
