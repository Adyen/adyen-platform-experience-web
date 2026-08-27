import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payout-details--error-not-found';

test.describe('Error - Not found', () => {
    test('should render the not found error message and reach out to support button', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByText('Entity was not found', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeVisible();
    });
});
