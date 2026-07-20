import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--apr';

test.describe('APR', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render Annual percentage rate field', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();
        await expect(page.getByText('Annual percentage rate')).toBeVisible();
        await expect(page.getByText('20%')).toBeVisible();
    });
});
