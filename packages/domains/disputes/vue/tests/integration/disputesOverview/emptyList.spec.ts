import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--empty-list';

test.describe('Disputes Overview - Empty list', () => {
    test('should render the empty list message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('No chargebacks found')).toBeVisible();
    });
});
