import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--network-error';

test.describe('Disputes Overview - Network error', () => {
    test('should render the list error message on network failure', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('We could not load your disputes.')).toBeVisible();
    });
});
