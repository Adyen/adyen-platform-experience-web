import { expect, type Page } from '@playwright/test';

export const expectDisabledPaginationButtons = async (page: Page) => {
    await expect(page.getByRole('button', { name: /Previous page/i, disabled: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Next page/i, disabled: true })).toBeVisible();
};

export const expectEmptyPayoutDataGridColumns = async (page: Page) => {
    const dataGrid = page.getByRole('grid');
    await expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible();
    await expect(dataGrid.getByRole('columnheader', { name: 'Funds captured', exact: true })).toBeVisible();
    await expect(dataGrid.getByRole('columnheader', { name: 'Adjustments', exact: true })).toBeVisible();
    await expect(dataGrid.getByRole('columnheader', { name: 'Net payout', exact: true })).toBeVisible();
};

export const openPayoutDetailsModal = async (page: Page, payoutRowIndex = 0) => {
    const dataGrid = page.getByRole('grid');
    const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
    const payoutRow = dataGridBody.getByRole('row').nth(payoutRowIndex);
    const detailsModal = page.getByRole('dialog');

    await payoutRow.click();

    await expect(detailsModal).toBeVisible();
    await expect(detailsModal.getByRole('button', { name: 'Close', exact: true, disabled: false })).toBeVisible();
    await expect(detailsModal.getByRole('button', { name: 'Adjustments', disabled: false, expanded: false })).toBeVisible();
    await expect(detailsModal.getByRole('button', { name: 'Funds captured', disabled: false, expanded: false })).toBeVisible();
};
