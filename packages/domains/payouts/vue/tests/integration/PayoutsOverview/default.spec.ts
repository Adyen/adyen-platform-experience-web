import { test, expect } from '@playwright/test';
import { clickOutsideDialog, goToStory } from '@integration-components/testing/playwright/utils';
import { testBalanceAccountFilter, testDateRangeFilter } from '../../../../fixtures/integration/filters';
import { openPayoutDetailsModal } from './shared/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--default';

test.describe('Default', () => {
    const NOW = Date.now();

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Render', () => {
        test('should render transactions overview', async ({ page }) => {
            const information = 'Payout information is generated each day at midnight, UTC time.';
            const toolbar = page.getByRole('toolbar');
            const dataGrid = page.getByRole('grid');

            const pagination = page.getByRole('navigation', { name: /Pagination/i });
            const limitSelect = pagination.getByRole('combobox', { name: /Items/i, disabled: false, expanded: false });

            // (1) Information
            await expect(page.getByText(information, { exact: true })).toBeVisible();

            // (2) Filter controls
            await expect(toolbar.getByRole('button', { name: /^Balance account/, disabled: false })).toBeVisible();
            await expect(toolbar.getByRole('button', { name: /^Date range/, disabled: false })).toBeVisible();

            // (3) Table
            await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Funds captured (EUR)', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Adjustments (EUR)', exact: true })).toBeVisible();
            await expect(dataGrid.getByRole('columnheader', { name: 'Net payout (EUR)', exact: true })).toBeVisible();

            await expect(dataGrid.getByRole('columnheader')).toHaveCount(4);
            await expect(dataGrid.getByRole('rowgroup')).toHaveCount(2);
            await expect(dataGrid.getByRole('row')).toHaveCount(10);
            await expect(dataGrid.getByRole('gridcell')).toHaveCount(36);

            // (4) Pagination controls
            await expect(limitSelect).toBeVisible();
            await expect(limitSelect).toHaveText('10');
            await expect(pagination.getByText('items')).toBeVisible();

            await expect(pagination.getByRole('button', { name: /Previous page/i, disabled: true })).toBeVisible();
            await expect(pagination.getByRole('button', { name: /Next page/i, disabled: true })).toBeVisible();
        });
    });

    test.describe('Details modal', () => {
        test.beforeEach(async ({ page }) => {
            await openPayoutDetailsModal(page, 0);
        });

        test('should render payout details modal and close the modal when dismissed', async ({ page }) => {
            const detailsModal = page.getByRole('dialog');
            await detailsModal.getByRole('button', { name: 'Close', exact: true, disabled: false }).click();
            await expect(detailsModal).toBeHidden();
        });

        test('should render payout details modal and close the modal when clicked outside', async ({ page }) => {
            const detailsModal = page.getByRole('dialog');
            await clickOutsideDialog(detailsModal);
        });
    });
});

test.describe('Filters', () => {
    // Use specific date to evade Bento's preset resolution/auto-selection for current day selection
    const now = new Date('2026-07-17T00:00:00.000Z').getTime();
    const variant = 'Bento';

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(now);
        await goToStory(page, { id: STORY_ID });
    });

    testBalanceAccountFilter({ variant });
    testDateRangeFilter({ variant, now });
});
