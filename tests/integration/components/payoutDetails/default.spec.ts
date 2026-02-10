import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { createPayoutBreakdownGroup, getFormattedPayoutDate } from './shared/utils';

const STORY_ID = 'mocked-payouts-payout-details--default';
const NOW = Date.now();

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payout details', async ({ page }) => {
        const formattedPayoutDate = getFormattedPayoutDate();

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
        const fundsCaptured = createPayoutBreakdownGroup(page, 'Funds captured');
        const adjustments = createPayoutBreakdownGroup(page, 'Adjustments');

        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();

        // Expand "Funds captured"
        await fundsCaptured.toggleBreakdown();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeCollapsed();

        // Collapse "Funds captured"
        await fundsCaptured.toggleBreakdown();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();

        // Expand "Adjustments"
        await adjustments.toggleBreakdown();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeExpanded();

        // Expand "Funds captured"
        await fundsCaptured.toggleBreakdown();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeExpanded();

        // Collapse "Adjustments"
        await adjustments.toggleBreakdown();
        await fundsCaptured.expectToBeExpanded();
        await adjustments.expectToBeCollapsed();

        // Collapse "Funds captured"
        await fundsCaptured.toggleBreakdown();
        await fundsCaptured.expectToBeCollapsed();
        await adjustments.expectToBeCollapsed();
    });

    test('should render "Funds captured" breakdown', async ({ page }) => {
        const fundsCaptured = createPayoutBreakdownGroup(page, 'Funds captured');
        const breakdown = page.getByRole('region', { name: 'Funds captured', exact: true });
        const breakdownLists = breakdown.locator('dl');
        const breakdownList = breakdownLists.nth(0);

        const capture = breakdownList.getByTestId('capture');
        const chargeback = breakdownList.getByTestId('chargeback');
        const correction = breakdownList.getByTestId('correction');
        const refund = breakdownList.getByTestId('refund');

        const fundsCapturedBreakdown = [
            capture.getByText('Captured', { exact: true }),
            capture.getByText('1,200.00', { exact: true }),

            chargeback.getByText('Chargebacks', { exact: true }),
            chargeback.getByText('- 300.00', { exact: true }),

            correction.getByText('Corrections', { exact: true }),
            correction.getByText('- 10.00', { exact: true }),

            refund.getByText('Refunds', { exact: true }),
            refund.getByText('110.00', { exact: true }),
        ];

        await fundsCaptured.expectToBeCollapsed();
        await expect(breakdownLists).toHaveCount(1);
        await Promise.all(fundsCapturedBreakdown.map(locator => expect(locator).not.toBeInViewport()));

        await fundsCaptured.toggleBreakdown();

        await fundsCaptured.expectToBeExpanded();
        await expect(breakdownLists).toHaveCount(1);
        await Promise.all(fundsCapturedBreakdown.map(locator => expect(locator).toBeInViewport()));

        await fundsCaptured.toggleBreakdown();

        await fundsCaptured.expectToBeCollapsed();
        await expect(breakdownLists).toHaveCount(1);
        await Promise.all(fundsCapturedBreakdown.map(locator => expect(locator).not.toBeInViewport()));
    });

    test('should render "Adjustments" breakdown', async ({ page }) => {
        const adjustments = createPayoutBreakdownGroup(page, 'Adjustments');
        const breakdown = page.getByRole('region', { name: 'Adjustments', exact: true });
        const breakdownLists = breakdown.locator('dl');
        const additionsBreakdownList = breakdownLists.nth(0);
        const subtractionsBreakdownList = breakdownLists.nth(1);

        const correction = additionsBreakdownList.getByTestId('correction');
        const grantRepayment = additionsBreakdownList.getByTestId('grantRepayment');
        const refund = additionsBreakdownList.getByTestId('refund');

        const fee = subtractionsBreakdownList.getByTestId('fee');
        const grantIssued = subtractionsBreakdownList.getByTestId('grantIssued');
        const other = subtractionsBreakdownList.getByTestId('other');
        const transfer = subtractionsBreakdownList.getByTestId('transfer');

        const adjustmentsBreakdown = [
            // Additions
            breakdown.getByText('Additions', { exact: true }),

            correction.getByText('Corrections', { exact: true }),
            correction.getByText('10.00', { exact: true }),

            grantRepayment.getByText('Grant repayments', { exact: true }),
            grantRepayment.getByText('600.00', { exact: true }),

            refund.getByText('Refunds', { exact: true }),
            refund.getByText('100.00', { exact: true }),

            // Subtractions
            breakdown.getByText('Subtractions', { exact: true }),

            fee.getByText('Fees', { exact: true }),
            fee.getByText('- 100.00', { exact: true }),

            grantIssued.getByText('Grant issued', { exact: true }),
            grantIssued.getByText('- 550.00', { exact: true }),

            other.getByText('Other', { exact: true }),
            other.getByText('- 10.00', { exact: true }),

            transfer.getByText('Transfers', { exact: true }),
            transfer.getByText('- 150.00', { exact: true }),
        ];

        await adjustments.expectToBeCollapsed();
        await expect(breakdownLists).toHaveCount(2);
        await Promise.all(adjustmentsBreakdown.map(locator => expect(locator).not.toBeInViewport()));

        await adjustments.toggleBreakdown();

        await adjustments.expectToBeExpanded();
        await expect(breakdownLists).toHaveCount(2);
        await Promise.all(adjustmentsBreakdown.map(locator => expect(locator).toBeInViewport()));

        await adjustments.toggleBreakdown();

        await adjustments.expectToBeCollapsed();
        await expect(breakdownLists).toHaveCount(2);
        await Promise.all(adjustmentsBreakdown.map(locator => expect(locator).not.toBeInViewport()));
    });
});
