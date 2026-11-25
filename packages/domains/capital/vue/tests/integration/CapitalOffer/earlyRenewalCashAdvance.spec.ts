import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--early-renewal-cash-advance';

test.describe('Early renewal - Cash advance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render cash advance renewal info in offer selection screen', async ({ page }) => {
        const selection = page.getByTestId('capital-offer-selection');

        await Promise.all([
            expect(selection.getByText('New advance')).toBeVisible(),
            expect(selection.getByText('Current fulfillment remaining')).toBeVisible(),
        ]);
    });

    test('should render cash advance renewal info in offer summary screen', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();
        const summary = page.getByTestId('capital-offer-summary');
        const newAdvanceDetails = summary.getByText('New advance details');

        await Promise.all([
            expect(summary.getByText('Advance you’ll receive')).toBeVisible(),
            expect(summary.getByText('New advance').first()).toBeVisible(),
            expect(summary.getByText('Current fulfillment remaining')).toBeVisible(),
            expect(newAdvanceDetails).toBeVisible(),
            expect(newAdvanceDetails.locator('..').getByText('New advance', { exact: true })).toBeVisible(),
            expect(summary.getByText('Total fulfillment amount', { exact: true })).toHaveCount(2),
            expect(summary.getByText('Compare your advances', { exact: true })).toBeVisible(),
            expect(summary.getByRole('tab', { name: 'New advance' })).toBeVisible(),
            expect(summary.getByRole('tab', { name: 'Current advance' })).toBeVisible(),
            expect(summary.getByText('Advance', { exact: true })).toBeVisible(),
            expect(summary.getByText('Daily earnings deduction', { exact: true })).toBeVisible(),
            expect(summary.getByText('30-day repayment minimum')).toBeHidden(),
            expect(summary.getByText('Estimated fulfillment period*')).toBeVisible(),
            expect(summary.getByText('6 months')).toBeVisible(),
            expect(summary.getByText('Maximum repayment date')).toBeHidden(),
            expect(
                summary.getByText(
                    '*Estimated fulfillment period is based on your past sales. The actual time period will vary based on your future daily sales.'
                )
            ).toBeVisible(),
            expect(summary.getByText('Your new advance has its own terms')).toBeVisible(),
            expect(
                summary.getByText(
                    'A new advance comes with its own fee, daily earnings deduction and terms, separate from your current advance. Please review its documentation carefully before you accept.'
                )
            ).toBeVisible(),
            expect(summary.getByText('What happens to your current advance')).toBeVisible(),
            expect(
                summary.getByText(
                    'If you accept: part of your new advance is used to fulfill the remaining amount of your current advance. You receive the rest, and your current advance is then complete.'
                )
            ).toBeVisible(),
            expect(summary.getByText("If you don't accept: nothing changes. Your current advance continues under its existing terms.")).toBeVisible(),
        ]);
    });
});
