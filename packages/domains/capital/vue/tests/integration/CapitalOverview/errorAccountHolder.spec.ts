import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-capital-capital-overview--error-account-holder';

test.describe('Error - Account holder', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render an error message', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Business financing')).toBeVisible(),
            expect(page.getByText('Your account is inactive')).toBeVisible(),
            expect(
                page.getByText("We couldn't load financial offers. Contact support for help and share error code 769ac4ce59f0f159ad672d38d3291e92")
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Reach out to support' })).toBeHidden(),
        ]);
    });
});

test.describe('onContactSupport argument', () => {
    // TODO: Enable when CapitalOverviewContainer passes onContactSupport to CapitalError.
    test.fixme('should render "Reach out to support" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
