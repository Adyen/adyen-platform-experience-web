import { expect, test } from '@playwright/test';
import { goToStory } from '../../../utils/utils';
import path from 'path';
import { fileURLToPath } from 'url';

const STORY_ID = 'mocked-disputes-dispute-management--defense-server-error';

test.describe('Error - Defense server error', () => {
    test('should render an error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Defend chargeback' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        await page.getByRole('button', { name: 'Select document type' }).click();
        await page.getByRole('option', { name: 'Flight Ticket Used' }).click();

        // Upload document
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const fixture = path.resolve(__dirname, '../../../fixtures/files/test-file.pdf');
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toBeEnabled();
        await fileInput.setInputFiles(fixture);

        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByText('Something went wrong')).toBeVisible();
        await expect(
            page.getByText("We couldn't process this dispute. Please try again, or contact support if you continue to have problems.")
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
        await page.getByRole('button', { name: 'Go back' }).click();

        await expect(page.getByText('Upload documents that support your dispute defense. Once submitted, no changes can be made.')).toBeVisible();
    });
});
