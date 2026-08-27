import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--store-network-error';

test.describe('Payment Links Overview - Store network error', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should display filter and store errors', async ({ page }) => {
        await Promise.all([
            expect(page.getByRole('alert')).toContainText('Something went wrong, please refresh the page.'),
            expect(page.getByText('Looks like there is a problem with the store ID.', { exact: true })).toBeVisible(),
            expect(page.getByText('Contact support for help.', { exact: true })).toBeVisible(),
        ]);
    });
});
