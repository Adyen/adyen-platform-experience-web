import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { CUSTOM_URL_EXAMPLE } from '../../../../stories/utils/constants';
import { openPayoutDetailsModal } from './shared/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render custom data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');

        await Promise.all([
            // (1) Standard columns (visible & hidden)
            expect(dataGrid.getByRole('columnheader', { name: 'Date', exact: true })).toBeVisible(),
            expect(dataGrid.getByRole('columnheader', { name: 'Funds captured (€)', exact: true })).toBeVisible(),
            expect(dataGrid.getByRole('columnheader', { name: 'Adjustments (€)', exact: true })).toBeHidden(), // hidden column
            expect(dataGrid.getByRole('columnheader', { name: 'Net payout (€)', exact: true })).toBeVisible(),

            // (2) Custom columns
            expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible(),
            expect(dataGrid.getByRole('columnheader', { name: 'Country', exact: true })).toBeVisible(),
            expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible(),
        ]);
    });

    test('should render correct data for each custom column', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
        const firstRow = dataGridBody.getByRole('row').nth(0);

        const summaryCell = firstRow.locator(`[aria-labelledby=_summary]`);
        const countryCell = firstRow.locator(`[aria-labelledby=_country]`);
        const actionCell = firstRow.locator(`[aria-labelledby=_sendEmail]`);

        const actionButton = actionCell.getByRole('button', { name: 'Send email', exact: true, disabled: false });
        const summaryLink = summaryCell.getByRole('link', { name: 'Summary', exact: true, disabled: false });
        const countryIcon = countryCell.getByAltText('', { exact: true });

        await Promise.all([
            expect(summaryCell).toHaveText('Summary'),
            expect(summaryLink).toBeVisible(),
            expect(countryIcon).toBeAttached(),
            expect(actionButton).toBeVisible(),
        ]);

        const [newPage] = await Promise.all([page.context().waitForEvent('page'), summaryLink.click()]);

        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(CUSTOM_URL_EXAMPLE);

        const messages: string[] = [];
        page.once('console', message => messages.push(message.text()));

        await actionButton.click();
        expect(messages).toContain('Action');
    });

    test('should render transaction details modal for clicked row', async ({ page }) => {
        await openPayoutDetailsModal(page, 0);
        const detailsModal = page.getByRole('dialog');
        await detailsModal.getByRole('button', { name: 'Close modal', exact: true, disabled: false }).click();
        await expect(detailsModal).toBeHidden();
    });
});
