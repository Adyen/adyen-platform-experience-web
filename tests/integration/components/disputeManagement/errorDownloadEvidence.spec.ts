import { expect, test } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--download-evidence-error';

test.describe('Error - Download evidence', () => {
    test('should render an error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByRole('button', { name: 'Download evidence' }).first().click();
        await expect(page.getByText('Failed, retry', { exact: true })).toBeVisible();
    });
});
