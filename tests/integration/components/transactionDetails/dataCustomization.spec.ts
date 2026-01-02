import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-transaction-details--data-customization';

test.describe('Data Customization', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render payment transaction details without hidden fields', async ({ page }) => {
        await expect(page.getByText('Original amount', { exact: true })).toBeVisible();
        await expect(page.getByText('€607.50', { exact: true })).toBeVisible();

        await expect(page.getByText('Fee', { exact: true })).toBeVisible();
        await expect(page.getByText('€0.00', { exact: true })).toBeVisible();

        await expect(page.getByText('PSP reference', { exact: true })).toBeVisible();
        await expect(page.getByText('PSP0000000000990', { exact: true })).toBeVisible();

        await expect(page.getByText('Account', { exact: true })).toBeHidden();
        await expect(page.getByText('S. Hopper - Main Account', { exact: true })).toBeHidden();

        await expect(page.getByText('Reference ID', { exact: true })).toBeHidden();
        await expect(page.getByText('4B7N9Q2Y6R1W5M8T', { exact: true })).toBeHidden();
    });

    test('should render payment transaction details with custom data fields', async ({ page }) => {
        await expect(page.getByText('Store', { exact: true })).toBeVisible();
        await expect(page.getByText('Sydney', { exact: true })).toBeVisible();

        await expect(page.getByText('Product', { exact: true })).toBeVisible();
        await expect(page.getByText('Coffee', { exact: true })).toBeVisible();

        await expect(page.getByText('Summary', { exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Full summary', exact: true })).toBeVisible();

        await expect(page.getByText('Country', { exact: true })).toBeVisible();
        await expect(page.getByAltText('', { exact: true })).toBeVisible();
    });

    test('should render payment transaction details with custom action buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Send email', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Send email', exact: true })).toBeEnabled();
    });
});
