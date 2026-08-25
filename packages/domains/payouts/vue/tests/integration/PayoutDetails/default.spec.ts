import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { BentoPayoutBreakdown } from '../../../../fixtures/utils/breakdown';
import { getFormattedPayoutDate } from '../../../../fixtures/utils/dateFormat';

const STORY_ID = 'mocked-payouts-payout-details--default';
const NOW = Date.now();

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payout details', async ({ page }) => {
        const formattedPayoutDate = getFormattedPayoutDate(new Date(NOW));

        await expect(page.getByText('Payout details', { exact: true })).toHaveCount(1);

        // Using first here to prevent clashes with other same texts displayed on page
        await expect(page.getByText('Net payout', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('900.00 EUR', { exact: true }).first()).toBeVisible();
        await expect(page.getByText(formattedPayoutDate.withDay, { exact: true })).toBeVisible();

        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();
        await expect(page.getByText('BA32272223222B5CTDQPM6W2H', { exact: true })).toBeVisible();

        await expect(page.getByText('Funds captured', { exact: true })).toBeVisible();
        await expect(page.getByText('1,000.00 EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('Adjustments', { exact: true })).toBeVisible();
        await expect(page.getByText('- 100.00 EUR', { exact: true })).toBeVisible();

        await expect(page.getByText('Remaining amount', { exact: true })).toBeVisible();
        await expect(page.getByText('900.00 EUR', { exact: true }).nth(1)).toBeVisible();
    });

    test('should render expandable payout breakdowns', async ({ page }) => {
        const fundsCaptured = new BentoPayoutBreakdown(page, 'Funds captured');
        const adjustments = new BentoPayoutBreakdown(page, 'Adjustments');

        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();

        // Expand "Funds captured"
        await fundsCaptured.toggle();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeCollapsed();

        // Collapse "Funds captured"
        await fundsCaptured.toggle();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();

        // Expand "Adjustments"
        await adjustments.toggle();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeExpanded();

        // Expand "Funds captured"
        await fundsCaptured.toggle();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeExpanded();

        // Collapse "Adjustments"
        await adjustments.toggle();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeCollapsed();

        // Collapse "Funds captured"
        await fundsCaptured.toggle();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();
    });

    test('should render "Funds captured" breakdown', async ({ page }) => {
        const breakdown = new BentoPayoutBreakdown(page, 'Funds captured');
        const list = breakdown.toggleContent;

        const locators = [
            list.getByRole('columnheader', { name: 'Funds captured', exact: true }),
            ...BentoPayoutBreakdown.getPairwiseLocators(list, ['Captured', '1,200.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(list, ['Chargebacks', '- 300.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(list, ['Corrections', '- 10.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(list, ['Refunds', '110.00 EUR']),
        ];

        await breakdown.expectToBeCollapsed();
        await expect(list).toBeHidden();
        for (const locator of locators) await expect(locator).toBeHidden();

        await breakdown.toggle();

        await breakdown.expectToBeExpanded();
        await expect(list).toBeVisible();
        for (const locator of locators) await expect(locator).toBeVisible();

        await breakdown.toggle();

        await breakdown.expectToBeCollapsed();
        await expect(list).toBeHidden();
        for (const locator of locators) await expect(locator).toBeHidden();
    });

    test('should render "Adjustments" breakdown', async ({ page }) => {
        const breakdown = new BentoPayoutBreakdown(page, 'Adjustments');
        const additions = breakdown.toggleContent.nth(0);
        const subtractions = breakdown.toggleContent.nth(1);

        const locators = [
            // Additions
            additions.getByRole('columnheader', { name: 'Additions', exact: true }),
            ...BentoPayoutBreakdown.getPairwiseLocators(additions, ['Corrections', '10.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(additions, ['Grant repayments', '600.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(additions, ['Refunds', '100.00 EUR']),

            // Subtractions
            subtractions.getByRole('columnheader', { name: 'Subtractions', exact: true }),
            ...BentoPayoutBreakdown.getPairwiseLocators(subtractions, ['Fees', '- 100.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(subtractions, ['Grant issued', '- 550.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(subtractions, ['Other', '- 10.00 EUR']),
            ...BentoPayoutBreakdown.getPairwiseLocators(subtractions, ['Transfers', '- 150.00 EUR']),
        ];

        await breakdown.expectToBeCollapsed();
        await expect(additions).toBeHidden();
        await expect(subtractions).toBeHidden();
        for (const locator of locators) await expect(locator).toBeHidden();

        await breakdown.toggle();

        await breakdown.expectToBeExpanded();
        await expect(additions).toBeVisible();
        await expect(subtractions).toBeVisible();
        for (const locator of locators) await expect(locator).toBeVisible();

        await breakdown.toggle();

        await breakdown.expectToBeCollapsed();
        await expect(additions).toBeHidden();
        await expect(subtractions).toBeHidden();
        for (const locator of locators) await expect(locator).toBeHidden();
    });
});
