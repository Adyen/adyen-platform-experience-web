import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--stores-misconfiguration';

test.describe('Payment Links Overview - Stores misconfiguration', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should display the account configuration error', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText('Looks like there is a problem with your account configuration.', { exact: true })).toBeVisible(),
            expect(page.getByText('Contact support for help.', { exact: true })).toBeVisible(),
        ]);
    });
});
