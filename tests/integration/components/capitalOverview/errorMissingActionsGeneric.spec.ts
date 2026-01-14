import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--error-missing-actions-generic';

test.describe('Error - Missing actions - Generic', () => {
    test('should render an error message when "Go to Terms & Conditions" button in clicked', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await page.getByText('Go to Terms & Conditions').click();
        await expect(page.getByText('Something went wrong. Try refreshing the page or come back later.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });
});
