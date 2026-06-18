import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--data-customization';

test.describe('Disputes Overview - Data customization', () => {
    test('should render the custom columns', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByRole('columnheader', { name: 'Summary' })).toBeVisible(),
            expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible(),
            expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible(),
        ]);
    });
});
