import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Row click', () => {
    test('should open the dispute management modal when a row is clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('No chargebacks found')).toBeHidden();

        await page.getByRole('row').nth(1).click();

        await expect(page.getByRole('dialog')).toBeVisible();
    });
});
