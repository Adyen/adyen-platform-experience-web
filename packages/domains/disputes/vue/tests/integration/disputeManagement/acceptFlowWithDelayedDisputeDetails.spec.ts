import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--accept-flow-with-delayed-dispute-details';

test.describe('Accept flow with delayed dispute details', () => {
    test('should react to dispute details loaded after the accept flow is mounted', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Load dispute details' }).click();

        await expect(page.getByText('Accept request for information')).toBeVisible();
        await expect(
            page.getByText('Once this request for information is accepted, it will be marked as expired and may lead to a chargeback in the future.')
        ).toBeVisible();

        await page.getByText('I agree').click();
        await page.getByRole('button', { name: 'Accept', exact: true }).click();

        await expect(page.getByText('Request for information has been accepted')).toBeVisible();
        await expect(page.getByText('Accepted a1b2c3d4-e5f6-4789-abcd-000000000001')).toBeVisible();
    });
});
