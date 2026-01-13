import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--grant-revoked';

test.describe('Grant: Revoked', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render revoked grant', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Revoked')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Revoked').hover();
        const tooltip = page.getByText('You accepted but then returned these funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
