import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-offer--error-offer-config';

test.describe('Error - Offer config', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render an error message', async ({ page }) => {
        await expect(
            page.getByText("We couldn't load financial offers. Contact support for help and share error code 825ac4ce59f0f159ad672d38d3291i55")
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeHidden();
    });
});

test.describe('onContactSupport prop', () => {
    test('should render support button when prop is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
