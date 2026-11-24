import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--actions-cash-advance';

test.describe('Actions - Cash advance', () => {
    test('should render pending cash advance with actions', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await Promise.all([
            expect(
                page.getByText(
                    "You're almost ready. To process your advance, we just need your input. Please complete these actions by February 15, 2025."
                )
            ).toBeVisible(),
        ]);
    });
});
