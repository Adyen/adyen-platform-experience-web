import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--single-action-cash-advance';

test.describe('Single action - Cash advance', () => {
    test('should render pending cash advance with single action', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(
            page.getByText("You're almost ready. To process your advance, we just need your input. Please complete this action by February 15, 2025.")
        ).toBeVisible();
    });
});
