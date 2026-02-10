import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-payouts-payout-details--data-customization';

test.describe('Data Customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payout details with custom data fields', async ({ page }) => {
        await expect(page.getByText('Store', { exact: true })).toBeVisible();
        await expect(page.getByText('Sydney', { exact: true })).toBeVisible();

        await expect(page.getByText('Product', { exact: true })).toBeVisible();
        await expect(page.getByText('Coffee', { exact: true })).toBeVisible();

        await expect(page.getByText('Summary', { exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'See summary', exact: true })).toBeVisible();

        await expect(page.getByText('Country', { exact: true })).toBeVisible();
        await expect(page.getByAltText('', { exact: true })).toBeVisible();
    });

    test('should render payout details with custom action buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Send email', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Send email', exact: true })).toBeEnabled();
    });
});
