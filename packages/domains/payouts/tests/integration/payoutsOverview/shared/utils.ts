import { expect, type Page } from '@playwright/test';

export const expectDisabledPaginationButtons = async (page: Page) => {
    await Promise.all([
        expect(page.getByRole('button', { name: 'Previous page', exact: true, disabled: true })).toBeVisible(),
        expect(page.getByRole('button', { name: 'Next page', exact: true, disabled: true })).toBeVisible(),
    ]);
};

export const expectEmptyPayoutDataGridColumns = async (page: Page) => {
    const dataGrid = page.getByRole('table');
    await Promise.all([
        expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible(),
        expect(dataGrid.getByRole('columnheader', { name: 'Funds captured', exact: true })).toBeVisible(),
        expect(dataGrid.getByRole('columnheader', { name: 'Adjustments', exact: true })).toBeVisible(),
        expect(dataGrid.getByRole('columnheader', { name: 'Net payout', exact: true })).toBeVisible(),
    ]);
};

export const openPayoutDetailsModal = async (page: Page, payoutRowIndex = 0) => {
    const dataGrid = page.getByRole('table');
    const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
    const payoutRow = dataGridBody.getByRole('row').nth(payoutRowIndex);
    const detailsModal = page.getByRole('dialog');

    await payoutRow.click();

    await Promise.all([
        expect(detailsModal).toBeVisible(),
        expect(detailsModal.getByRole('button', { name: 'Close modal', exact: true, disabled: false })).toBeVisible(),
        expect(detailsModal.getByRole('button', { name: 'Adjustments', exact: true, disabled: false, expanded: false })).toBeVisible(),
        expect(detailsModal.getByRole('button', { name: 'Funds captured', exact: true, disabled: false, expanded: false })).toBeVisible(),
    ]);
};
