import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--empty-list';

test.describe('Empty list', () => {
    test('should render a message for an empty list response', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        // New chargebacks
        await expect(page.getByText('No chargebacks found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new chargebacks.')).toBeVisible();
        await page.getByRole('tab', { name: 'Fraud alerts' }).click();

        // Fraud alerts
        await expect(page.getByText('No fraud alerts found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new fraud alerts.')).toBeVisible();
        await page.getByRole('tab', { name: 'Ongoing & closed' }).click();

        // Ongoing and closed
        await expect(page.getByText('No disputes found')).toBeVisible();
        await expect(page.getByText('Try different filters or check again later for new disputes.')).toBeVisible();
    });
});
