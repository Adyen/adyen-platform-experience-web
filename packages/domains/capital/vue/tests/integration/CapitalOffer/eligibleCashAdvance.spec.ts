import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--eligible-cash-advance';

test.describe('Eligible - Cash advance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render cash advance offer selection screen', async ({ page }) => {
        const selection = page.getByTestId('capital-offer-selection');

        await Promise.all([
            expect(page.getByText('Merchant cash advance request', { exact: true })).toBeVisible(),
            expect(page.getByText('Advances are provided by Adyen N.V., acting through its UK Branches.')).toBeVisible(),
            expect(selection.getByText('Select advance amount', { exact: true })).toBeVisible(),
            expect(selection.getByText('Select a fulfillment plan', { exact: true })).toBeVisible(),
            expect(selection.getByRole('radio', { name: '8% of daily sales' })).toBeVisible(),
            expect(selection.getByText('Est. 3 months*')).toBeVisible(),
            expect(selection.getByRole('radio', { name: '11% of daily sales' })).toBeChecked(),
            expect(selection.getByText('Est. 6 months*')).toBeVisible(),
            expect(selection.getByRole('radio', { name: '15% of daily sales' })).toBeVisible(),
            expect(selection.getByText('Est. 12 months*')).toBeVisible(),
            expect(selection.getByText('Advance terms', { exact: true })).toBeVisible(),
            expect(selection.getByText('Total fulfillment amount', { exact: true })).toBeVisible(),
            expect(selection.getByText('Daily earnings deduction', { exact: true })).toBeVisible(),
            expect(selection.getByText('Maximum repayment date', { exact: true })).toBeHidden(),
            expect(
                selection.getByText(
                    '*Estimated fulfillment period is based on your past sales. The actual time period will vary based on your future daily sales.',
                    { exact: true }
                )
            ).toBeVisible(),
            expect(
                selection.getByText(
                    'This merchant cash advance is a purchase of your future receivables, not a loan or credit facility. It is not regulated by the Financial Conduct Authority and does not carry the protections of the Financial Services and Markets Act 2000 or the Consumer Credit Act 1974.',
                    { exact: true }
                )
            ).toBeVisible(),
        ]);
    });

    test('should render cash advance offer summary screen', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();
        const summary = page.getByTestId('capital-offer-summary');

        await Promise.all([
            expect(page.getByText('Merchant cash advance summary')).toBeVisible(),
            expect(page.getByText('Advances are provided by Adyen N.V., acting through its UK Branches.')).toBeVisible(),
            expect(summary.getByText('Advance', { exact: true })).toBeVisible(),
            expect(summary.getByText('Total fulfillment amount')).toBeVisible(),
            expect(summary.getByText('Advance terms')).toBeVisible(),
            expect(summary.getByText('Daily earnings deduction')).toBeVisible(),
            expect(summary.getByText('30-day repayment minimum')).toBeHidden(),
            expect(summary.getByText('Estimated fulfillment period*')).toBeVisible(),
            expect(summary.getByText('6 months')).toBeVisible(),
            expect(summary.getByText('Maximum repayment date')).toBeHidden(),
            expect(summary.getByRole('button', { name: 'Go back' })).toBeVisible(),
            expect(summary.getByRole('button', { name: 'Submit £13,000 request' })).toBeVisible(),
            expect(
                summary.getByText(
                    '*Estimated fulfillment period is based on your past sales. The actual time period will vary based on your future daily sales.',
                    { exact: true }
                )
            ).toBeVisible(),
            expect(
                summary.getByText(
                    'This merchant cash advance is a purchase of your future receivables, not a loan or credit facility. It is not regulated by the Financial Conduct Authority and does not carry the protections of the Financial Services and Markets Act 2000 or the Consumer Credit Act 1974.',
                    { exact: true }
                )
            ).toBeVisible(),
        ]);
    });
});
