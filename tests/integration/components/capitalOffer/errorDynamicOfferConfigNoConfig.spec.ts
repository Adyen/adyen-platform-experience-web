import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-capital-offer--error-dynamic-offer-config-no-config';

test.describe('Error - Dynamic offer config - No config', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render an error message', async ({ page }) => {
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText("We couldn't continue with the offer. Contact support for help.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});

test.describe('onContactSupport argument', () => {
    test('should render ""Reach out to support"" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
