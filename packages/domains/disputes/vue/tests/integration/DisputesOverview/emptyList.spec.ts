import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--empty-list';

test.describe('Disputes Overview - Empty list', () => {
    test('should render an empty message for every status group', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await expect(page.getByText('No chargebacks found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new chargebacks.')).toBeVisible();

        await page.getByRole('tab', { name: 'Fraud alerts' }).click();
        await expect(page.getByText('No fraud alerts found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new fraud alerts.')).toBeVisible();

        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();
        await expect(page.getByText('No disputes found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new disputes.')).toBeVisible();
    });
});
