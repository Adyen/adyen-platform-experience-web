import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STORY_ID = 'mocked-disputes-dispute-management--defend-flow-with-delayed-dispute-details';

test.describe('Defend flow with delayed dispute details', () => {
    test('should react to dispute details loaded after the defend flow is mounted', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Load dispute details' }).click();

        await expect(page.getByText('Defend chargeback')).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.getByText('Upload documents that support your dispute defense. Once submitted, no changes can be made.')).toBeVisible();

        await page.getByRole('combobox', { name: 'Select document type' }).click();
        await page.getByRole('option', { name: 'Paper airline ticket' }).click();

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const fixture = path.resolve(__dirname, '../../../../fixtures/files/test-file.pdf');
        await page.locator('input[type="file"]').setInputFiles(fixture);

        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByText('Evidence has been submitted')).toBeVisible();
        await expect(page.getByText('Defended a1b2c3d4-e5f6-4789-abcd-000000000001')).toBeVisible();
    });
});
