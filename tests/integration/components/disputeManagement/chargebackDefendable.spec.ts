import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import { fileURLToPath } from 'url';
import path from 'path';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-defendable';

test.describe('Chargeback - Defendable', () => {
    test('should render button to accept and alert for defending the chargeback', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Chargeback' })).toBeVisible();
        await expect(page.locator('.adyen-pe-tag', { hasText: 'Undefended' })).toBeVisible();

        await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();

        await page.getByRole('button', { name: 'Defend chargeback' }).click();

        await expect(
            page.getByText(
                'A fee is charged for every defended chargeback. We recommend responding only when you have clear and convincing evidence.'
            )
        ).toBeVisible();

        const submitButton = page.getByRole('button', { name: 'Submit' });

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(submitButton).toBeDisabled();

        await page.getByRole('button', { name: 'Select document type' }).click();
        await page.getByRole('option', { name: 'Paper airline ticket' }).click();
        await expect(page.getByText('Documentation establishing that the cardholder was issued paper airline tickets.')).toBeVisible();

        // Upload document
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const fixture = path.resolve(__dirname, '../../../fixtures/files/test-file.pdf');
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(fixture);

        await submitButton.click();

        await expect(page.getByText('Evidence has been submitted')).toBeVisible();
        await expect(page.getByText('The chargeback details will be reviewed by the scheme, which can take up to 60 days.')).toBeVisible();
        await page.getByRole('button', { name: 'Show details' }).click();
        await expect(page.locator('.adyen-pe-tag--default', { hasText: 'Chargeback' })).toBeVisible();
    });
});
