import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { DefaultPayoutBreakdown } from '../../../../fixtures/utils/breakdown';
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

        // Using first here to prevent clashes with other same texts displayed on page
        await expect(page.getByText('Net payout', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('900.00 EUR', { exact: true }).first()).toBeVisible();
        await expect(page.getByText(formattedPayoutDate.withDay, { exact: true })).toBeVisible();

        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();
        await expect(page.getByText('BA32272223222B5CTDQPM6W2H', { exact: true })).toBeVisible();

        await expect(page.getByText('Funds captured', { exact: true })).toBeVisible();
        await expect(page.getByText('€1,000.00', { exact: true })).toBeVisible();

        await expect(page.getByText('Adjustments', { exact: true })).toBeVisible();
        await expect(page.getByText('- €100.00', { exact: true })).toBeVisible();

        await expect(page.getByText('Remaining amount', { exact: true })).toBeVisible();
        await expect(page.getByText('€900.00', { exact: true }).first()).toBeVisible();
    });

    test('should render expandable payout breakdowns', async ({ page }) => {
        const fundsCaptured = new DefaultPayoutBreakdown(page, 'Funds captured');
        const adjustments = new DefaultPayoutBreakdown(page, 'Adjustments');

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
        const breakdown = new DefaultPayoutBreakdown(page, 'Funds captured');
        const list = breakdown.toggleContent;

        const locators = [
            ...DefaultPayoutBreakdown.getPairwiseLocators(list, ['Captured', '1,200.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(list, ['Chargebacks', '- 300.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(list, ['Corrections', '- 10.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(list, ['Refunds', '110.00']),
        ];

        await breakdown.expectToBeCollapsed();
        await expect(list).toBeInViewport();
        for (const locator of locators) await expect(locator).not.toBeInViewport();

        await breakdown.toggle();

        await breakdown.expectToBeExpanded();
        await expect(list).toBeInViewport();
        for (const locator of locators) await expect(locator).toBeInViewport();

        await breakdown.toggle();

        await breakdown.expectToBeCollapsed();
        await expect(list).toBeInViewport();
        for (const locator of locators) await expect(locator).not.toBeInViewport();
    });

    test('should render "Adjustments" breakdown', async ({ page }) => {
        const breakdown = new DefaultPayoutBreakdown(page, 'Adjustments');
        const additions = breakdown.toggleContent.getByTestId('payout-adjustments-additions-breakdown');
        const subtractions = breakdown.toggleContent.getByTestId('payout-adjustments-subtractions-breakdown');

        const locators = [
            // Additions
            breakdown.toggleContent.getByText('Additions', { exact: true }),
            ...DefaultPayoutBreakdown.getPairwiseLocators(additions, ['Corrections', '10.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(additions, ['Grant repayments', '600.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(additions, ['Refunds', '100.00']),

            // Subtractions
            breakdown.toggleContent.getByText('Subtractions', { exact: true }),
            ...DefaultPayoutBreakdown.getPairwiseLocators(subtractions, ['Fees', '- 100.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(subtractions, ['Grant issued', '- 550.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(subtractions, ['Other', '- 10.00']),
            ...DefaultPayoutBreakdown.getPairwiseLocators(subtractions, ['Transfers', '- 150.00']),
        ];

        await breakdown.expectToBeCollapsed();
        await expect(additions).not.toBeInViewport();
        await expect(subtractions).not.toBeInViewport();
        for (const locator of locators) await expect(locator).not.toBeInViewport();

        await breakdown.toggle();

        await breakdown.expectToBeExpanded();
        await expect(additions).toBeInViewport();
        await expect(subtractions).toBeInViewport();
        for (const locator of locators) await expect(locator).toBeInViewport();

        await breakdown.toggle();

        await breakdown.expectToBeCollapsed();
        await expect(additions).not.toBeInViewport();
        await expect(subtractions).not.toBeInViewport();
        for (const locator of locators) await expect(locator).not.toBeInViewport();
    });
});
