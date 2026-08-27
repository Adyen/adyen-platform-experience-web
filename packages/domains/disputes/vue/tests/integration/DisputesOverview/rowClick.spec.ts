import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Row click', () => {
    test('should open the dispute management modal when a row is clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('No chargebacks found')).toBeHidden();

        const grid = page.getByRole('grid');
        await grid.getByRole('rowgroup').nth(1).getByRole('row').first().click();

        const disputeManagementModal = page.getByRole('dialog', { name: 'Dispute management', exact: true });

        await expect(disputeManagementModal).toBeVisible();
        await expect(disputeManagementModal.getByText('Dispute management', { exact: true })).toHaveCount(0);
    });
});
