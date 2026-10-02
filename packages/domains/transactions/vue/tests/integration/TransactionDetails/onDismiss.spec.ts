import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-transactions-transaction-details--default';
const OVERVIEW_STORY_ID = 'mocked-transactions-transactions-overview--default';

test.describe('onDismiss argument', () => {
    test.describe('Standalone', () => {
        test('should render the "Go back" dismiss button when onDismiss is provided', async ({ page }) => {
            await goToStory(page, { id: STORY_ID, args: { onDismiss: 'Enabled' } });

            await expect(page.getByRole('button', { name: 'Go back', exact: true, disabled: false })).toBeVisible();
        });

        test('should not render the "Go back" dismiss button when onDismiss is not provided', async ({ page }) => {
            await goToStory(page, { id: STORY_ID });

            await expect(page.getByRole('button', { name: 'Go back', exact: true })).not.toBeVisible();
        });
    });

    test.describe('Within a modal', () => {
        test('should not render the "Go back" dismiss button inside the overview modal', async ({ page }) => {
            await goToStory(page, { id: OVERVIEW_STORY_ID });

            const dataGrid = page.getByRole('grid');
            await dataGrid.getByRole('rowgroup').nth(1).getByRole('row').first().click();

            const detailsModal = page.getByRole('dialog', { name: 'Transaction details', exact: true });
            await expect(detailsModal.getByRole('tab', { name: 'Details', exact: true })).toBeVisible();

            // The overview modal has its own close affordance instead of the dismiss button
            await expect(detailsModal.getByRole('button', { name: 'Go back', exact: true })).not.toBeVisible();
            await expect(detailsModal.getByRole('button', { name: 'Close', exact: true, disabled: false })).toBeVisible();
        });
    });
});
