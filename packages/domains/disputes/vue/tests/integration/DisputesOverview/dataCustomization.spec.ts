import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { expectCustomDisputeDetails } from '../shared/customDataAssertions';

const STORY_ID = 'mocked-disputes-disputes-overview--data-customization';

test.describe('Disputes Overview - Data customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render the custom columns', async ({ page }) => {
        const grid = page.getByRole('grid');

        await Promise.all([
            expect(grid.getByRole('columnheader', { name: 'Summary' })).toBeVisible(),
            expect(grid.getByRole('columnheader', { name: 'Action' })).toBeVisible(),
        ]);
    });

    test('should not render the hidden standard column', async ({ page }) => {
        const grid = page.getByRole('grid');

        await expect(grid.getByRole('columnheader', { name: 'Respond by' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();
    });

    test('should retain the mobile table layout without custom columns', async ({ page }) => {
        await page.setViewportSize({ width: 479, height: 800 });

        const grid = page.getByRole('grid');
        await expect(grid.getByRole('columnheader', { name: 'Summary', exact: true })).toHaveCount(0);
        await expect(grid.getByRole('columnheader', { name: 'Action', exact: true })).toHaveCount(0);
    });

    test('should render the content of each custom cell', async ({ page }) => {
        const grid = page.getByRole('grid');

        await expect(grid.getByRole('link', { name: 'Summary' }).first()).toBeVisible();
        await expect(grid.getByRole('button', { name: 'Send email' }).first()).toBeVisible();
    });

    test('should invoke the custom button action', async ({ page }) => {
        const grid = page.getByRole('grid');
        const messages: string[] = [];
        page.on('console', message => messages.push(message.text()));

        await grid.getByRole('button', { name: 'Send email' }).first().click();

        await expect.poll(() => messages).toContain('Action');
    });

    test('should keep custom columns after switching status groups', async ({ page }) => {
        const grid = page.getByRole('grid');
        await expect(grid.getByRole('columnheader', { name: 'Summary' })).toBeVisible();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await expect(grid.getByRole('columnheader', { name: 'Summary' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Action' })).toBeVisible();

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect(grid.getByRole('columnheader', { name: 'Summary' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Action' })).toBeVisible();
    });

    test('should keep the hidden standard column hidden across status groups', async ({ page }) => {
        const grid = page.getByRole('grid');

        await expect(grid.getByRole('columnheader', { name: 'Respond by' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await expect(grid.getByRole('columnheader', { name: 'Total payment amount' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect(grid.getByRole('columnheader', { name: 'Status' })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeHidden();
    });

    test('should pass details customization to the dispute management modal', async ({ page }) => {
        const grid = page.getByRole('grid');
        const customizedRow = grid.getByRole('row').filter({ has: page.getByRole('link', { name: 'Summary', exact: true }) });

        await customizedRow.getByRole('gridcell').first().click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await expectCustomDisputeDetails({
            root: dialog,
            summaryLinkName: 'Summary',
            hiddenLabels: ['Dispute reference'],
        });
    });
});
