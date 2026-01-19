import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--default';

test.describe('Payment Links Overview', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Payment Links Overview - Validations', () => {
        test('should display empty list message (not an error) when filtering by paymentLinkId with invalid characters', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await page.getByRole('button', { name: 'Payment Link ID' }).click();

            // Enter an invalid paymentLinkId (contains non-alphanumeric characters)
            await page.getByRole('textbox').fill('PL-1234@test!');

            await page.getByRole('button', { name: 'Apply' }).click();

            await expect(page.getByText('No links to display')).toBeVisible();
        });
    });

    test.describe('Payment Links Overview - Default Flow', () => {
        test('should display list with correct initial state - first row has Active status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Wait for the table to load
            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            // Get the first data row and check that status is Active
            await expect(table.getByRole('cell', { name: 'Status' }).first()).toHaveText('Active');
        });

        test('should switch to Inactive tab and display first row with Completed status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Click the Inactive tab
            await page.getByRole('tab', { name: 'Inactive', exact: true }).click();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            // Verify first row has Completed status
            await expect(table.getByRole('cell', { name: 'Status' }).first()).toHaveText('Completed');
        });

        test('should display Active and Inactive tabs', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Check for tabs
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Inactive', exact: true })).toBeVisible();

            // Verify Active tab is selected by default
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toHaveAttribute('aria-selected', 'true');
        });

        test('should display all filter options', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await expect(page.getByRole('button', { name: /date/i })).toBeVisible();

            await expect(page.getByRole('button', { name: 'Type' })).toBeVisible();

            await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();

            await expect(page.getByRole('button', { name: 'Merchant reference' })).toBeVisible();

            await expect(page.getByRole('button', { name: 'Payment Link ID' })).toBeVisible();
        });

        test('should display Create Payment Link and Settings buttons', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Check for Create Payment Link button
            await expect(page.getByRole('button', { name: 'Create payment link' })).toBeVisible();

            // Check for Settings button (icon button)
            await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
        });

        test('should open Create Payment Link modal when clicking the create button', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Click Create Payment Link button
            await page.getByRole('button', { name: 'Create payment link' }).click();

            // Verify modal is open
            await expect(page.getByRole('dialog')).toBeVisible();

            // Verify is link creation modal
            await expect(page.getByText('New payment link', { exact: true })).toBeVisible();
        });

        test('should open Settings modal when clicking the settings button', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await page.getByRole('button', { name: /settings/i }).click();

            // Verify modal is open
            await expect(page.getByRole('dialog')).toBeVisible();

            // Verify is settings modal
            await expect(page.getByText('Settings', { exact: true })).toBeVisible();
        });

        test('should display payment link table with expected columns', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            // Check for expected column headers
            await expect(table.getByRole('columnheader', { name: /reference/i })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: /amount/i })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: /status/i })).toBeVisible();
        });

        test('should display multiple rows in the payment links table', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            // Verify multiple rows are displayed
            const rows = table.getByRole('row');
            await expect(rows).toHaveCount(10); // Default page limit
        });

        test('should filter by Link Type', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Click Link Type filter
            await page.getByRole('button', { name: 'Type' }).click();

            // Select Single use option
            await page.getByRole('option', { name: 'Single use' }).click();

            // Apply filter
            await page.getByRole('button', { name: 'Apply' }).click();

            // Verify table displays results
            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            await expect(table.getByRole('cell', { name: 'Type' }).first()).toHaveText('Single use');

            // Verify every row has Single use type
            const rows = table.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            await expect(table.getByRole('cell', { name: 'Status' }).first()).toHaveText('Active');
            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByText('Single use')).toBeVisible();
            }
        });

        test('should filter by Status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();
            await expect(table.getByRole('row').first()).toBeVisible();

            await page.getByRole('button', { name: 'Status' }).click();

            const listbox = page.getByRole('listbox');
            await expect(listbox).toBeVisible();

            const activeOption = listbox.getByRole('option', { name: 'Active' });
            const paymentPendingOption = listbox.getByRole('option', { name: 'Payment pending' });

            if ((await activeOption.getAttribute('aria-selected')) === 'true') {
                await activeOption.click();
            }

            await paymentPendingOption.click();

            await page.getByRole('button', { name: 'Apply' }).click();

            await expect(table.getByRole('row').first().getByText('Payment pending')).toBeVisible();

            // Verify all rows show Payment pending status
            const rows = table.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByText('Payment pending')).toBeVisible();
            }
        });

        test('should filter by Merchant Reference text', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Click Merchant Reference filter
            await page.getByRole('button', { name: 'Merchant reference' }).click();

            const merchantReference = 'REF-001';

            // Enter a merchant reference
            await page.getByRole('textbox').fill(merchantReference);

            // Apply filter
            await page.getByRole('button', { name: 'Apply' }).click();

            // Verify table shows results
            await expect(page.getByRole('cell', { name: 'Merchant reference' }).first()).toHaveText(merchantReference);

            // Verify every row has Single use type
            const rows = page.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBe(1);
        });

        test('should filter by Payment Link ID', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Click Merchant Reference filter
            await page.getByRole('button', { name: 'Payment Link ID' }).click();

            const paymentId = 'PLTEST001';

            // Enter a merchant reference
            await page.getByRole('textbox').fill(paymentId);
            await page.getByRole('button', { name: 'Apply' }).click();

            await expect(page.getByRole('cell', { name: 'Payment link ID' }).first()).toHaveText(paymentId);

            // Verify every row has Single use type
            const rows = page.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBe(1);
        });
    });
});
