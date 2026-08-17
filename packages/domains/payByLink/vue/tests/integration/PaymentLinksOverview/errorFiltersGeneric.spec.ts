import { expect, test } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-links-overview--error-filters-generic';

test.describe('Payment Links Overview - Filter error', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should display the alert and disable affected filters', async ({ page }) => {
        await Promise.all([
            expect(page.getByRole('alert')).toContainText('Something went wrong, please refresh the page.'),
            expect(page.getByRole('button', { name: 'Type', exact: true })).toBeDisabled(),
            expect(page.getByRole('button', { name: 'Status', exact: true })).toBeDisabled(),
        ]);
    });
});
