import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--ineligible';

test.describe('Ineligible', () => {
    test('should render an info message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Adyen Capital request')).toBeVisible(),
            expect(page.getByText('Adyen Capital is provided by Adyen N.V.')).toBeVisible(),
            expect(page.getByText('No offer available currently')).toBeVisible(),
            expect(page.getByText('We update our offers regularly, so be sure to check back again in the future.')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Go back' })).toBeHidden(),
        ]);
    });
});
