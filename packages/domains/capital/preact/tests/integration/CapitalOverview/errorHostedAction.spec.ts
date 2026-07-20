import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--error-hosted-action';

test.describe('Error - Hosted action', () => {
    test('should render an error message when signing button in clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByText('Sign terms & conditions').click();
        await expect(page.getByText('Something went wrong. Try refreshing the page or come back later.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });
});
