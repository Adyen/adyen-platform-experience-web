import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--ineligible';

test.describe('Ineligible', () => {
    test('should render ineligible screen', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Need some extra money?')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('You will soon qualify for a financial offer!')).toBeVisible();
    });
});

test.describe('mountIfIneligible argument', () => {
    test('should not render the component when argument is false', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfIneligible: 'false' } });
        await expect(page.getByText('Need some extra money?')).toBeHidden();
    });
});
