import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--eligible-ca';

test.describe('Eligible CA', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render CA subtitle', async ({ page }) => {
        await expect(page.getByText('Adyen Capital is provided by Adyen Canada Ltd.')).toBeVisible();
    });

    test('should render APR field', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();
        await expect(page.getByText('Annual percentage rate')).toBeVisible();
        await expect(page.getByText('20%')).toBeVisible();
    });

    test('should show a tooltip when APR label is hovered', async ({ page }) => {
        await page.getByRole('button', { name: 'Review request' }).click();
        await page.getByText('Annual percentage rate').hover();
        const tooltip = page.getByText(
            'The Annual Percentage Rate (APR) is the cost of borrowing of this loan under Adyen Capital User Terms, expressed as an annual rate.'
        );
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
