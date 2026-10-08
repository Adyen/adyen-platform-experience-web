import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import { DEFAULT_STORY_ID } from '../../../../fixtures/constants/PaymentLinksOverview';

test.describe('Compact filters', () => {
    test.use({ viewport: { width: 375, height: 900 } });

    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: DEFAULT_STORY_ID });
        await expect(page.getByRole('grid')).toBeVisible();
        // The store, link type and status filters are only configured once their data
        // resolves, and the modal snapshots the filters it is given when it opens.
        await page.waitForLoadState('networkidle', { timeout: 10000 });
    });

    test('should collapse the filters into an "All filters" button', async ({ page }) => {
        const filterBar = page.locator('.b-filter-bar');

        await expect(filterBar.getByRole('button', { name: /^All filters/ })).toBeVisible();
        await expect(filterBar.getByRole('button', { name: /^Stores/ })).toBeHidden();
        await expect(filterBar.getByRole('button', { name: /^Date range/ })).toBeHidden();
        await expect(filterBar.getByRole('button', { name: /^Type/ })).toBeHidden();
        await expect(filterBar.getByRole('button', { name: /^Status/ })).toBeHidden();
        await expect(filterBar.getByRole('button', { name: /^Merchant reference/ })).toBeHidden();
        await expect(filterBar.getByRole('button', { name: /^Payment link ID/ })).toBeHidden();
    });

    test('should open all filters in a modal', async ({ page }) => {
        await page
            .locator('.b-filter-bar')
            .getByRole('button', { name: /^All filters/ })
            .click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('Stores', { exact: true })).toBeVisible();
        await expect(modal.getByText('Date range', { exact: true })).toBeVisible();
        await expect(modal.getByText('Type', { exact: true })).toBeVisible();
        await expect(modal.getByText('Status', { exact: true })).toBeVisible();
        await expect(modal.getByText('Merchant reference', { exact: true })).toBeVisible();
        await expect(modal.getByText('Payment link ID', { exact: true })).toBeVisible();
    });
});
