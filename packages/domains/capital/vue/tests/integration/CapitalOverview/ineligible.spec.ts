import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--ineligible';

test.describe('Ineligible', () => {
    // TODO: Enable when the Vue Capital Offer component renders the ineligible state.
    test.fixme('should render ineligible screen', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Need some extra money?')).toBeVisible(),
            expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible(),
            expect(page.getByText('No offer available currently')).toBeVisible(),
            expect(page.getByText('We update our financial offers regularly, so be sure to check back again in the future.')).toBeVisible(),
        ]);
    });
});

test.describe('mountIfIneligible argument', () => {
    test('should not render the component when argument is false', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfIneligible: 'false' } });
        await expect(page.getByText('Need some extra money?')).toBeHidden();
    });
});
