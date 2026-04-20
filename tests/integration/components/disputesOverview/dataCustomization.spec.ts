import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--data-customization';

test.describe('Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should not render hidden data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        await expect(dataGrid.getByRole('columnheader', { name: 'Dispute reason', exact: true })).toBeHidden();
    });

    test('should render custom data grid columns', async ({ page }) => {
        const dataGrid = page.getByRole('table');

        await Promise.all([
            expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible(),
            expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible(),
        ]);
    });

    test('should render correct data for each custom column', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        const dataGridBody = dataGrid.getByRole('rowgroup').nth(1);
        const firstRow = dataGridBody.getByRole('row').nth(0);

        const summaryCell = firstRow.locator(`[aria-labelledby=_summary]`);
        const actionCell = firstRow.locator(`[aria-labelledby=_sendEmail]`);

        await expect(summaryCell.getByRole('link', { name: 'Summary', exact: true })).toBeVisible();
        await expect(actionCell.getByRole('button', { name: 'Send email', exact: true })).toBeVisible();

        const messages: string[] = [];
        page.once('console', message => messages.push(message.text()));

        await actionCell.getByRole('button').click();
        expect(messages).toContain('Action');
    });

    test('should keep custom columns after switching tabs', async ({ page }) => {
        const dataGrid = page.getByRole('table');
        await expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect(dataGrid.getByRole('columnheader', { name: 'Summary', exact: true })).toBeVisible();
        await expect(dataGrid.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();
    });

    test('should keep hidden fields hidden across tabs', async ({ page }) => {
        const dataGrid = page.getByRole('table');

        // Wait for columns to be visible
        await expect(dataGrid.getByRole('columnheader', { name: 'Respond by', exact: true })).toBeVisible();

        await expect(dataGrid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await expect(dataGrid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect(dataGrid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();
    });
});
