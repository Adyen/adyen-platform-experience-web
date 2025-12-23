import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-overview--grant-failed';

test.describe('Grant: Failed', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render failed grant', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Failed' })).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render a tooltip when the status tag is hovered', async ({ page }) => {
        await page.getByRole('button', { name: 'Failed' }).hover();
        const tooltip = page.getByText("We couldn't process this request. Try again with a new offer.");
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
