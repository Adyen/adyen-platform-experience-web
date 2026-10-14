import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--default';

test.describe('CAD currency', () => {
    test('should show CAD transactions in the list and CAD totals in the insights', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByRole('grid')).toBeVisible();

        // Transactions list: the three CAD transactions are on the first page
        const dataGrid = page.getByRole('grid');
        await expect(dataGrid.getByRole('rowgroup').nth(1).getByText('CAD', { exact: true })).toHaveCount(3);

        // Switch to the Insights view
        await page.getByRole('radio', { name: 'Insights', exact: true }).click();
        await expect(page.getByText('Period result', { exact: true })).toBeVisible();

        // Select CAD as the insights currency
        const filterButton = page.getByRole('button', { name: /^Currency/ });
        await filterButton.click();
        const filterDialog = page.getByRole('dialog');
        await expect(filterDialog).toBeVisible();
        await filterDialog.getByRole('option', { name: 'CAD', exact: true }).click();
        await filterDialog.getByRole('button', { name: 'Apply', exact: true, disabled: false }).click();
        await expect(filterDialog).toBeHidden();

        // Insights: CAD period totals are rendered from the mocked CAD transactions
        await expect(page.getByText('276.50', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('667.00', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('CAD', { exact: true }).first()).toBeVisible();
    });
});
