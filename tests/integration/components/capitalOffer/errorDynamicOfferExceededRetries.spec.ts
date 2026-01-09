import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-offer--error-dynamic-offer-exceeded-retries';

test.describe('Error - Dynamic offer - Exceeded retries', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('How much money do you need?')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText("We couldn't load financial offers. Try refreshing the page or come back later.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });
});
