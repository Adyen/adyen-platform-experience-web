import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payout-details--error-details';

test.describe('Error - Details', () => {
    test('should render payout details error display', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const errorMessage = "We couldn't load the payout details. Try refreshing the page or come back later.";
        const refreshButton = page.getByRole('button', { name: 'Refresh', exact: true });

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText(errorMessage, { exact: true })).toBeVisible();
        await expect(refreshButton).toBeVisible();
        await expect(refreshButton).toBeEnabled();
    });
});
