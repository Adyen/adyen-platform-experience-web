import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--default';

test.describe('Payment Links Overview', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Payment Links Overview - Validations', () => {
        test('should display empty list message (not an error) when filtering by paymentLinkId with invalid characters', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            await page.getByRole('button', { name: 'Payment Link ID' }).click();

            // Enter an invalid paymentLinkId (contains non-alphanumeric characters)
            await page.getByRole('textbox').fill('PL-1234@test!');

            await page.getByRole('button', { name: 'Apply' }).click();

            await expect(page.getByText('No links to display')).toBeVisible();
        });
    });

    test.describe('Payment Links Overview - Happy Flow', () => {
        test('should display list depending on applied filters', async ({ page }) => {
            await expect(page.getByText('Payment links')).toBeVisible();

            // Check for tabs
            await expect(page.getByRole('tab', { name: 'Active', exact: true })).toBeVisible();
            await expect(page.getByRole('tab', { name: 'Inactive', exact: true })).toBeVisible();

            // Check for filters
        });
    });
});
