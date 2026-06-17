import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-reports-reports-overview--default';

test.describe('Default', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test.describe('Render', () => {
        test('should render the component title', async ({ page }) => {
            await expect(page.getByText('Reports', { exact: true })).toBeVisible();
        });
    });
});
