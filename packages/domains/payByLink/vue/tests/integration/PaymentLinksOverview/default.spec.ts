import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
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

            const grid = page.getByRole('grid');
            await expect(grid).toBeVisible();

            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            await expect(rows.first().getByText('Active', { exact: true })).toBeVisible();
        });

        test('should switch to Inactive tab and display first row with Completed status', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await goToTab(page, 'Inactive');

            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            await expect(rows.first().getByText('Completed', { exact: true })).toBeVisible();
        });

        test('should display Active and Inactive tabs', async ({ page }) => {
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Inactive', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toHaveAttribute('aria-selected', 'true');
        });

        test('should display all filter options', async ({ page }) => {
            await expect(page.getByRole('button', { name: /^Date range/ })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Type' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Status' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Merchant reference' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Payment Link ID' })).toBeVisible();
        });

        test('should render Stores before the other filters when stores load', async ({ page }) => {
            const filterButtons = page.getByRole('button', {
                name: /^(?:Stores|Date range|Type|Status|Merchant reference|Payment Link ID)/,
            });

            await expect(filterButtons.first()).toHaveText('Stores');
            await expect(filterButtons.nth(1)).toHaveText('Date range:Last 30 days');
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

            // [TODO]: PaymentLinkSettings is not yet migrated to Vue; the modal currently renders a placeholder
            await expect(page.getByText('Open link settings', { exact: true })).toBeVisible();
        });

        test('should display payment link grid with expected columns', async ({ page }) => {
            const grid = page.getByRole('grid');
            await expect(grid).toBeVisible();

            await expect(grid.getByRole('columnheader', { name: /reference/i })).toBeVisible();
            await expect(grid.getByRole('columnheader', { name: /amount/i })).toBeVisible();
            await expect(grid.getByRole('columnheader', { name: /status/i })).toBeVisible();
        });

        test('should display multiple rows in the payment links grid', async ({ page }) => {
            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            await expect(rows).toHaveCount(10);
        });

        test('should display payment link details when a row is clicked', async ({ page }) => {
            await goToStory(page, { id: DEFAULT_STORY_ID });

            const grid = page.getByRole('grid');
            const firstRow = grid.getByRole('rowgroup').nth(1).getByRole('row').first();

            await firstRow.click();

            const detailsModal = page.getByRole('dialog', { name: 'Payment link details' });
            await expect(detailsModal.getByText('Payment link ID')).toBeVisible();
            await expect(detailsModal.getByText(PAYMENT_LINK_ID)).toBeVisible();
            await expect(detailsModal.getByRole('tab', { name: 'Link information' })).toBeVisible();
            await expect(detailsModal.getByRole('button', { name: 'Expire now' })).toBeVisible();
        });

        test('should refresh the current-day date range after expiring a payment link', async ({ page }) => {
            const grid = page.getByRole('grid');
            const firstRow = grid.getByRole('rowgroup').nth(1).getByRole('row').first();
            await firstRow.click();

            const detailsModal = page.getByRole('dialog', { name: 'Payment link details' });
            await detailsModal.getByRole('button', { name: 'Expire now' }).click();
            await detailsModal.getByRole('button', { name: 'Expire link' }).click();
            await expect(detailsModal.getByText('Link has been deactivated')).toBeVisible();

            const refreshRequest = page.waitForRequest(request => {
                const url = new URL(request.url());
                return request.method() === 'GET' && url.pathname.endsWith('/paybylink/paymentLinks') && url.searchParams.has('createdUntil');
            });
            const refreshStartedAt = Date.now();

            await detailsModal.getByRole('button', { name: 'Go back to payment links' }).click();

            const createdUntil = new URL((await refreshRequest).url()).searchParams.get('createdUntil');
            expect(createdUntil).not.toBeNull();
            expect(Math.abs(new Date(createdUntil!).getTime() - refreshStartedAt)).toBeLessThan(10_000);
        });

        test('should filter by Link Type', async ({ page }) => {
            await page.getByRole('button', { name: 'Type' }).click();

            const filterDialog = page.getByRole('dialog');
            await filterDialog.getByRole('checkbox', { name: 'Single use', exact: true, checked: false }).click();
            await filterDialog.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();
            await expect(filterDialog).toBeHidden();

            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByText('Single use', { exact: true })).toBeVisible();
            }
        });

        test('should filter by Status', async ({ page }) => {
            await page.getByRole('button', { name: 'Status' }).click();

            const filterDialog = page.getByRole('dialog');
            await filterDialog.getByRole('checkbox', { name: 'Payment pending', exact: true, checked: false }).click();
            await filterDialog.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();
            await expect(filterDialog).toBeHidden();

            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            const rowCount = await rows.count();
            expect(rowCount).toBeGreaterThan(0);

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).getByText('Payment pending', { exact: true })).toBeVisible();
            }
        });

        test('should filter by Merchant Reference text', async ({ page }) => {
            await applyTextFilter(page, 'Merchant reference', MERCHANT_REFERENCE);

            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            await expect(rows).toHaveCount(1);
            await expect(rows.first().getByText(MERCHANT_REFERENCE)).toBeVisible();
        });

        test('should filter by Payment Link ID', async ({ page }) => {
            await applyTextFilter(page, 'Payment Link ID', PAYMENT_LINK_ID);

            const grid = page.getByRole('grid');
            const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
            await expect(rows).toHaveCount(1);
            await expect(rows.first().getByText(PAYMENT_LINK_ID)).toBeVisible();
        });
    });
});
