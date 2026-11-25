import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--pending-cash-advance';

test.describe('Pending - Cash advance', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render pending cash advance', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Advance amount')).toBeVisible(),
            expect(page.getByText('Advance ID')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Copy advance ID' })).toBeVisible(),
        ]);
    });

    test('should render the relevant tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Pending').hover();
        await expect(page.getByRole('tooltip', { name: 'You should get your advance within one business day' })).toBeVisible();
    });
});
