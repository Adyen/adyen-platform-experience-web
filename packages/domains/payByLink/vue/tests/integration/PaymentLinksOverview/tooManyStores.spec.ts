import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--too-many-stores';

test.describe('Payment Links Overview - Too many stores', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should display the validation error', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText('We couldn’t load your payment links.', { exact: true })).toBeVisible(),
            expect(page.getByText('Try refreshing the page or come back later.', { exact: true })).toBeVisible(),
        ]);
    });
});
