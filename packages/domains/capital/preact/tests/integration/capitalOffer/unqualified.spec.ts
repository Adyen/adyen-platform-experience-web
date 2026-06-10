import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--unqualified';

test.describe('Unqualified', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText("We couldn't continue with the offer. Contact support for help.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});
