import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-capital-overview--grant-missing-action-anacredit';

test.describe('Grant: Missing Action Anacredit', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render pending grant with actions', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Action needed')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(
            page.getByText('We need a bit more information to process your funds. Please complete this action by February 15, 2025:')
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit information' })).toBeVisible();
    });

    test('should go to Business Financing task when button in clicked', async ({ page }) => {
        await page.getByText('Submit information').click();
        const redirectionURL = 'https://www.adyen.com/capital';
        await page.waitForURL(redirectionURL);
        expect(page.url()).toBe(redirectionURL);
    });
});
