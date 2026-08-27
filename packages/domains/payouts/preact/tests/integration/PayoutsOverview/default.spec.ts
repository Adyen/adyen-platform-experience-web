import { test, expect } from '@playwright/test';
import { clickOutsideDialog, expectBalanceAccountPaginationReset, goToStory } from '@integration-components/testing/playwright/utils';
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
            const filters = page.getByRole('group', { name: 'Payouts filters', exact: true });
            const table = page.getByRole('table');

            const pagination = page.getByRole('group', { name: 'Payouts pagination', exact: true });
            const limitSelect = pagination.getByRole('button', { name: 'Payouts per page', exact: true, disabled: false, expanded: false });

            // (1) Information
            await expect(page.getByText(information, { exact: true })).toBeVisible();

            // (2) Filter controls
            await expect(filters.getByRole('button', { name: 'Balance account', exact: true, disabled: false, expanded: false })).toBeVisible();
            await expect(filters.getByRole('button', { name: 'Date range', exact: true, disabled: false, expanded: false })).toBeVisible();

            // (3) Table
            await expect(table.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: 'Funds captured', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: 'Adjustments', exact: true })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: 'Net payout', exact: true })).toBeVisible();

            await expect(table.getByRole('columnheader')).toHaveCount(4);
            await expect(table.getByRole('rowgroup')).toHaveCount(2);
            await expect(table.getByRole('row')).toHaveCount(9);
            await expect(table.getByRole('cell')).toHaveCount(36);

            // (4) Pagination controls
            await expect(pagination.getByText('Showing ')).toBeVisible();
            await expect(limitSelect).toHaveText('10');
            await expect(limitSelect).toBeVisible();

            await expect(pagination.getByRole('button', { name: 'Previous page', exact: true, disabled: true })).toBeVisible();
            await expect(pagination.getByRole('button', { name: 'Next page', exact: true, disabled: true })).toBeVisible();
        });
    });

    test.describe('Details modal', () => {
        test.beforeEach(async ({ page }) => {
            await openPayoutDetailsModal(page, 0);
        });

        test('should render payout details modal and close the modal when dismissed', async ({ page }) => {
            const detailsModal = page.getByRole('dialog', { name: 'Payout details', exact: true });
            await expect(detailsModal.getByText('Payout details', { exact: true })).toHaveCount(0);
            await detailsModal.getByRole('button', { name: 'Close modal', exact: true, disabled: false }).click();
            await expect(detailsModal).toBeHidden();
        });

        test('should render payout details modal and close the modal when clicked outside', async ({ page }) => {
            const detailsModal = page.getByRole('dialog');
            await clickOutsideDialog(detailsModal);
        });
    });
});

test.describe('Filters', () => {
    const now = Date.now();
    const variant = 'Default';

    test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(now);
        await goToStory(page, { id: STORY_ID });
    });

    testBalanceAccountFilter({ variant });
    testDateRangeFilter({ variant, now });
});

test('should reset pagination when selecting another balance account', async ({ page }) => {
    await goToStory(page, { id: STORY_ID, args: { allowLimitSelection: 'false', preferredLimit: '5' } });
    await expectBalanceAccountPaginationReset({ endpointPath: '/payouts', page, variant: 'Default' });
});
