import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--eligible-with-ongoing-loan';

test.describe('Eligible with ongoing - Loan', () => {
    test('should render an info message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('No offer available currently')).toBeVisible();
        await expect(page.getByText('We update our offers regularly, so be sure to check back again in the future.')).toBeVisible();
    });
});
