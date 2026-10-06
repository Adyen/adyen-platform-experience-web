import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--default';

test.describe('Compact filters', () => {
    test.use({ viewport: { width: 375, height: 900 } });

    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByRole('grid')).toBeVisible();
        // The balance account filter is only configured once its data resolves, and the
        // modal snapshots the filters it is given when it opens.
        await page.waitForLoadState('networkidle', { timeout: 10000 });
    });

    test('should collapse the filters into an "All filters" button', async ({ page }) => {
        const toolbar = page.getByRole('toolbar');

        await expect(toolbar.getByRole('button', { name: /^All filters/ })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: /^Balance account/ })).toBeHidden();
        await expect(toolbar.getByRole('button', { name: /^Date range/ })).toBeHidden();
    });

    test('should open all filters in a modal', async ({ page }) => {
        await page
            .getByRole('toolbar')
            .getByRole('button', { name: /^All filters/ })
            .click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('Balance account', { exact: true })).toBeVisible();
        await expect(modal.getByText('Date range', { exact: true })).toBeVisible();
    });
});
