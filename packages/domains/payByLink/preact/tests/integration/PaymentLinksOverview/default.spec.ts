import { test, expect } from '@playwright/test';
import { expectPaginationReset, goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';
import { applyTextFilter, goToTab, openCreatePaymentLinkModal, openSettingsModal } from '../../../../fixtures/integration/utils';
import { DEFAULT_STORY_ID, INVALID_PAYMENT_LINK_ID, MERCHANT_REFERENCE, PAYMENT_LINK_ID } from '../../../../fixtures/constants/PaymentLinksOverview';

test.describe('Payment Links Overview', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: DEFAULT_STORY_ID });
    });

    test.describe('Payment Links Overview - Validations', () => {
        test('should display empty list message (not an error) when filtering by paymentLinkId with invalid characters', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await applyTextFilter(page, 'Payment Link ID', INVALID_PAYMENT_LINK_ID);

            await expect(page.getByText('No links to display')).toBeVisible();
        });
    });

    test.describe('Payment Links Overview - Default Flow', () => {
        test('should display list with correct initial state - first row has Active status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            await expect(table.getByRole('cell', { name: 'Status' }).first()).toHaveText('Active');
        });

        test('should switch to Inactive tab and display first row with Completed status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await goToTab(page, 'Inactive');

            const table = page.getByRole('table');
            await expect(table).toBeVisible();
            await expect(table.getByRole('cell', { name: 'Status' }).first()).toHaveText('Completed');
        });

        test('should display Active and Inactive tabs', async ({ page }) => {
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Inactive', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toHaveAttribute('aria-selected', 'true');
        });

        test('should display all filter options', async ({ page }) => {
            await expect(page.getByRole('button', { name: /date/i })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Type' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Merchant reference' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Payment Link ID' })).toBeVisible();
        });

        test('should display Create Payment Link and Settings buttons', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Create payment link' })).toBeVisible();
            await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
        });

        test('should open Create Payment Link modal when clicking the create button', async ({ page }) => {
            await openCreatePaymentLinkModal(page);

            await expect(page.getByText('New payment link', { exact: true })).toBeVisible();
        });

        test('should open Settings modal when clicking the settings button', async ({ page }) => {
            await openSettingsModal(page);

            await expect(page.getByText('Settings', { exact: true })).toBeVisible();
        });

        test('should display payment link table with expected columns', async ({ page }) => {
            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            await expect(table.getByRole('columnheader', { name: /reference/i })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: /amount/i })).toBeVisible();
            await expect(table.getByRole('columnheader', { name: /status/i })).toBeVisible();
        });

        test('should display multiple rows in the payment links table', async ({ page }) => {
            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            const rows = table.getByRole('row');
            await expect(rows).toHaveCount(10);
        });

        test('should filter by Link Type', async ({ page }) => {
            await page.getByRole('button', { name: 'Type' }).click();

            await page.getByRole('option', { name: 'Single use' }).click();
            await page.getByRole('button', { name: 'Apply' }).click();

            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            await expect(table.getByRole('cell', { name: 'Type' }).first()).toHaveText('Single use');

            const rows = table.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByRole('cell', { name: 'Type' })).toHaveText('Single use');
            }
        });

        test('should filter by Status', async ({ page }) => {
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

            const rows = table.getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByRole('cell', { name: 'Status' })).toHaveText('Payment pending');
            }
        });

        test('should filter by Merchant Reference text', async ({ page }) => {
            await applyTextFilter(page, 'Merchant reference', MERCHANT_REFERENCE);

            await expect(page.getByRole('cell', { name: 'Merchant reference' }).first()).toHaveText(MERCHANT_REFERENCE);

            const rows = page.getByRole('table').getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBe(1);
        });

        test('should filter by Payment Link ID', async ({ page }) => {
            await applyTextFilter(page, 'Payment Link ID', PAYMENT_LINK_ID);

            await expect(page.getByRole('cell', { name: 'Payment link ID' }).first()).toHaveText(PAYMENT_LINK_ID);

            const rows = page.getByRole('table').getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBe(1);
        });

        test('should reset pagination without sending private store state', async ({ page }) => {
            const storeId = 'STORE_NY_001';
            await expectPaginationReset({
                endpointPath: '/paymentLinks',
                isFilterRequest: (request, expectedStoreId) => {
                    const url = new URL(request.url());
                    return url.searchParams.get('storeIds') === expectedStoreId && !url.searchParams.has('_storeIds');
                },
                page,
                triggerFilterChange: async () => {
                    await updateStoryArgs(page, DEFAULT_STORY_ID, { storeIds: storeId });
                    return storeId;
                },
            });
        });
    });
});
