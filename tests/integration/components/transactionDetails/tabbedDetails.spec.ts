import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--tabbed-details';

test.describe('Tabbed details', () => {
    const expectSamePaymentStatusBoxRendering = async (page: Page) => {
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Payment' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag--blue', { hasText: 'Partially refunded' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag')).toHaveCount(2);

        // Using first here to prevent clashes with other amounts displayed on page
        await expect(page.getByText('607.50 EUR', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('•••• •••• •••• 1945', { exact: true })).toBeVisible();
        await expect(page.getByText('Monday, August 29, 2022 at 09:47 AM GMT-3', { exact: true })).toBeVisible();
    };

    const expectBeforePaymentRefundDetailsRendering = async (page: Page) => {
        await expect(page.getByText('You already refunded €473.75', { exact: true })).toBeVisible();
        await expect(page.locator('.adyen-pe-alert--highlight')).toHaveCount(1);
        await expect(page.locator('.adyen-pe-alert')).toHaveCount(1);

        const refundButton = page.getByRole('button', { name: 'Refund payment', exact: true });

        await expect(refundButton).toBeVisible();
        await expect(refundButton).toBeEnabled();
    };

    const expectSamePaymentSummaryRendering = async (page: Page) => {
        await expect(page.getByText('Original amount', { exact: true })).toBeVisible();
        await expect(page.getByText('€642.00', { exact: true })).toBeVisible();

        for (const labelText of ['Tip amount', 'Surcharge amount']) {
            const labels = page.getByText(labelText, { exact: true });
            const allLabels = await labels.all();

            await expect(labels).toHaveCount(2);

            for (let label of allLabels) {
                await expect(label).toBeVisible();
            }
        }

        await expect(page.getByText('€1.50', { exact: true })).toBeVisible();
        await expect(page.getByText('- €1.50', { exact: true })).toBeVisible();

        await expect(page.getByText('€15.00', { exact: true })).toBeVisible();
        await expect(page.getByText('- €15.00', { exact: true })).toBeVisible();

        await expect(page.getByText('Gross amount', { exact: true })).toBeVisible();
        await expect(page.getByText('€658.50', { exact: true })).toBeVisible();

        await expect(page.getByText('Fees', { exact: true })).toBeVisible();
        await expect(page.getByText('- €9.50', { exact: true })).toBeVisible();

        await expect(page.getByText('Split payment', { exact: true })).toBeVisible();
        await expect(page.getByText('- €25.00', { exact: true })).toBeVisible();

        await expect(page.getByText('Net amount', { exact: true })).toBeVisible();
        await expect(page.getByText('€607.50', { exact: true })).toBeVisible();
    };

    const expectSamePaymentDetailsRendering = async (page: Page) => {
        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeVisible();

        await expect(page.getByText('Reference ID', { exact: true })).toBeVisible();
        await expect(page.getByText('4B7N9Q2Y6R1W5M8T', { exact: true })).toBeVisible();

        await expect(page.getByText('Merchant reference', { exact: true })).toBeVisible();
        await expect(page.getByText('TX-F9X2V8L7P1K6W', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByTestId('copy-icon')).toHaveCount(3);
    };

    const expectSamePaymentTimelineRendering = async (page: Page) => {
        for (const text of ['Aug 29, 2022, 09:47', 'Amount', 'Status']) {
            const elems = page.getByText(text, { exact: true });
            const allElems = await elems.all();

            await expect(elems).toHaveCount(2);

            for (let label of allElems) {
                await expect(label).toBeVisible();
            }
        }

        const showMoreButton = page.getByRole('button', { name: 'Show 1 more', exact: true });

        await expect(showMoreButton).toBeVisible();
        await expect(showMoreButton).toBeEnabled();

        await showMoreButton.click();
        await expect(showMoreButton).toBeHidden();
        await expect(page.getByRole('button', { name: 'Show less', exact: true })).toBeVisible();

        for (const text of ['Aug 29, 2022, 09:47', 'Amount', 'Status']) {
            const elems = page.getByText(text, { exact: true });
            const allElems = await elems.all();

            await expect(elems).toHaveCount(3);

            for (let label of allElems) {
                await expect(label).toBeVisible();
            }
        }

        await page.getByRole('button', { name: 'Show less', exact: true }).click();
        await expect(showMoreButton).toBeVisible();
        await expect(showMoreButton).toBeEnabled();

        for (const text of ['Aug 29, 2022, 09:47', 'Amount', 'Status']) {
            const elems = page.getByText(text, { exact: true });
            const allElems = await elems.all();

            await expect(elems).toHaveCount(2);

            for (let label of allElems) {
                await expect(label).toBeVisible();
            }
        }
    };

    const navigateToTab = async (page: Page, name: 'Details' | 'Summary' | 'Timeline') => {
        const navigatedToTab = expect(page.getByRole('tab', { name, exact: true, selected: true })).toBeVisible();
        await expect(page.getByRole('tab', { name, exact: true, selected: false })).toBeVisible();
        await page.getByRole('tab', { name, exact: true }).click();
        await navigatedToTab;
    };

    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render navigation tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: 'Summary', exact: true })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Details', exact: true })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Timeline', exact: true })).toBeVisible();
        await expect(page.getByRole('tab')).toHaveCount(3);
    });

    test('should initially render the "Summary" tab', async ({ page }) => {
        await expectSamePaymentStatusBoxRendering(page);
        await expectSamePaymentSummaryRendering(page);
        await expectBeforePaymentRefundDetailsRendering(page);
    });

    test('should render the "Details" tab', async ({ page }) => {
        await navigateToTab(page, 'Details');
        await expectSamePaymentStatusBoxRendering(page);
        await expectSamePaymentDetailsRendering(page);
        await expectBeforePaymentRefundDetailsRendering(page);
    });

    test('should render the "Timeline" tab', async ({ page }) => {
        await navigateToTab(page, 'Timeline');
        await expectSamePaymentStatusBoxRendering(page);
        await expectSamePaymentTimelineRendering(page);
        await expectBeforePaymentRefundDetailsRendering(page);
    });

    test('should render the "Summary" tab', async ({ page }) => {
        await navigateToTab(page, 'Details');
        await navigateToTab(page, 'Summary');
        await expectSamePaymentStatusBoxRendering(page);
        await expectSamePaymentSummaryRendering(page);
        await expectBeforePaymentRefundDetailsRendering(page);
    });

    test('should return to "Summary" tab from refund view', async ({ page }) => {
        await navigateToTab(page, 'Details');
        await page.getByRole('button', { name: 'Refund payment', exact: true }).click();
        await page.getByRole('button', { name: 'Go back', exact: true }).click();

        // Back to payment summary (same)
        await expectSamePaymentStatusBoxRendering(page);
        await expectSamePaymentSummaryRendering(page);
        await expectBeforePaymentRefundDetailsRendering(page);
    });
});
