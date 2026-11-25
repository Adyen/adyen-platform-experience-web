import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--single-hosted-action';

test.describe('Single hosted action', () => {
    test('should render pending loan with single action', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await Promise.all([
            expect(
                page.getByText(
                    "You're almost ready. To process your funds, we just need your input. Please complete this action by February 15, 2025."
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Submit information' })).toBeHidden(),
            expect(page.getByRole('button', { name: 'Sign terms of service' })).toBeVisible(),
        ]);
    });
});
