import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--unsupported-region';

test.describe('Unsupported region', () => {
    test('should render a message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Business financing request', { exact: true })).toBeVisible();
        await expect(page.getByText('Stay tuned!')).toBeVisible();
        await expect(page.getByText('Business financing isn’t available in your region yet, but check back here for an offer.')).toBeVisible();
    });
});
