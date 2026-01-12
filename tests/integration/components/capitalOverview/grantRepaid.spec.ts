import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--grant-repaid';

test.describe('Grant: Repaid', () => {
    test('should render repaid grant', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Fully repaid')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });
});
