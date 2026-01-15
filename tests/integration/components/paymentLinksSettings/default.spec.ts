import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { fileURLToPath } from 'url';
import path from 'path';

const STORY_ID = 'mocked-pay-by-link-payment-link-settings--default';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fullSizeIcon = path.resolve(__dirname, '../../../fixtures/files/theme-logo.jpg');
const fullWidthIcon = path.resolve(__dirname, '../../../fixtures/files/theme-logo-full-width.jpg');

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should successfully save theme changes', async ({ page }) => {
        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        // Upload documents
        const fullSizeUpload = page.locator('input[type="file"]').first();
        await fullSizeUpload.setInputFiles(fullSizeIcon);

        const fullWidthUpload = page.locator('input[type="file"]').nth(0);
        await fullWidthUpload.setInputFiles(fullWidthIcon);

        const brandInput = page.getByRole('textbox', { name: 'Brand name' });
        await brandInput.fill('Test brand name');

        await saveButton.click();

        await expect(page.getByText('The changes have been saved successfully.')).toBeVisible();
    });

    test('should successfully save terms and conditions changes', async ({ page }) => {
        const navButton = page.getByRole('button', { name: 'Terms and conditions' });
        await navButton.click();

        const termsAndConditionsInput = page.getByRole('textbox', { name: 'Your terms and conditions URL' });
        await termsAndConditionsInput.fill('https://example.com/terms');
        await expect(page.getByText('Your terms and conditions URL has changed, you need to confirm this again')).toBeVisible();

        await page.getByRole('button', { name: 'all requirements.' }).click();
        await expect(page.getByText('Terms and conditions requirements for Pay by Link')).toBeVisible();
        await page.getByRole('button', { name: 'Go back' }).click();

        await page.getByText('I confirm that these Terms').click();

        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        await expect(page.getByText('The changes have been saved successfully.')).toBeVisible();
    });

    test('should validate fields for theme changes', async ({ page }) => {
        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();
        // Check the required field error
        await expect(page.getByText('You need to provide a brand')).toBeVisible();

        // Check the correct files specifications for uploads
        const fullSizeUpload = page.locator('input[type="file"]').first();
        await fullSizeUpload.setInputFiles(fullWidthIcon);
        await expect(page.getByText('Image dimensions must be 200x200 pixels. Please upload an image with the correct resolution.')).toBeVisible();

        const fullWidthUpload = page.locator('input[type="file"]').nth(1);
        await fullWidthUpload.setInputFiles(fullSizeIcon);
        await expect(page.getByText('Image dimensions must be 300x30 pixels. Please upload an image with the correct resolution.')).toBeVisible();
    });

    test('should validate fields for terms and conditions changes', async ({ page }) => {
        const navButton = page.getByRole('button', { name: 'Terms and conditions' });
        await navButton.click();

        const termsAndConditionsInput = page.getByRole('textbox', { name: 'Your terms and conditions URL' });
        await termsAndConditionsInput.fill('example.com/terms');

        const saveButton = page.getByRole('button', { name: 'Save' });
        await saveButton.click();

        await expect(page.getByText('You must confirm acceptance of the terms to continue')).toBeVisible();
        await expect(page.getByText('Please enter a valid URL.')).toBeVisible();
    });
});
