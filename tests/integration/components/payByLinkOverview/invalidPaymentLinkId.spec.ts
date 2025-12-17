import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-overview--default';

test.describe('PayByLinkOverview - Invalid Payment Link ID', () => {
    test('should display empty list message (not an error) when filtering by paymentLinkId with invalid characters', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Payment links')).toBeVisible();

        await page.getByRole('button', { name: 'Payment Link ID' }).click();

        // Enter an invalid paymentLinkId (contains non-alphanumeric characters)
        await page.getByRole('textbox').fill('PL-1234@test!');

        await page.getByRole('button', { name: 'Apply' }).click();

        await expect(page.getByText('No links to display')).toBeVisible();
    });
});
