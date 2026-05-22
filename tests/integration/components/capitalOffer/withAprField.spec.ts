import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-offer--with-apr-field';

test.describe('With APR field', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render Annual percentage rate field', async ({ page }) => {
        await page.getByRole('button', { name: 'Review offer' }).click();
        await expect(page.getByText('Annual percentage rate')).toBeVisible();
        await expect(page.getByText('20%')).toBeVisible();
    });
});
