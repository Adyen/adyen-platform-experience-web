import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--grant-missing-action-sign-tos';

test.describe('Grant: Missing Action Sign TOS', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render pending grant with actions', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Action needed')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByText('Sign the Terms & Conditions to receive your funds. This offer expires on February 15, 2025.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go to Terms & Conditions' })).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render a tooltip status tag is hovered', async ({ page }) => {
        await page.getByText('Action needed').hover();
        const tooltip = page.getByText('Sign the terms to receive your funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should go to terms and conditions page when "Go to Terms & Conditions" button in clicked', async ({ page }) => {
        await page.getByText('Go to Terms & Conditions').click();
        const redirectionURL = 'https://www.adyen.com/';
        await page.waitForURL(redirectionURL);
        expect(page.url()).toBe(redirectionURL);
    });
});
