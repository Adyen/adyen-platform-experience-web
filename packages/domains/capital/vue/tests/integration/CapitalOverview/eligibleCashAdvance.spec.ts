import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--eligible-cash-advance';

test.describe('Eligible - Cash advance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should offer a new advance after the previous advance is complete', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('You are now eligible to request a new advance up to £25,000')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new advance', exact: true })).toBeVisible(),
            expect(page.getByText('Completed', { exact: true })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new loan', exact: true })).toBeHidden(),
        ]);
    });
});
