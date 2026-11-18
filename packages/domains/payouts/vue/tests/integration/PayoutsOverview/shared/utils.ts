import { expect, type Page } from '@playwright/test';

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
