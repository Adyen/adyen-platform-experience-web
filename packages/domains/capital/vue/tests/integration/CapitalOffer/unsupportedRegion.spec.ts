import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--unsupported-region';

test.describe('Unsupported region', () => {
    test('should render an info message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Adyen Capital request')).toBeVisible(),
            expect(page.getByText('Adyen Capital is provided by Adyen N.V.')).toBeHidden(),
            expect(page.getByText('Stay tuned!')).toBeVisible(),
            expect(page.getByText('Adyen Capital isn’t available in your region yet, but check back here for an offer.')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Go back' })).toBeHidden(),
        ]);
    });
});
