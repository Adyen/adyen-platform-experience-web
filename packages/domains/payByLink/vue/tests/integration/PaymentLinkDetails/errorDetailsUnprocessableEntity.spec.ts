import { test, expect } from '@playwright/test';
import { goToStory, setTime } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-pay-by-link-payment-link-details--error-details-unprocessable-entity';

test.describe('Error - Details (unprocessable entity)', () => {
    test.beforeEach(async ({ page }) => {
        await setTime(page);
    });

    test('should render button to contact support when refresh is not available', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('There was an unexpected error', { exact: true })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeVisible(),
        ]);
        await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden();
    });

    test('should not render any button when onContactSupport is not provided', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Disabled' } });

        await expect(page.getByText('There was an unexpected error', { exact: true })).toBeVisible();
        await Promise.all([
            expect(page.getByRole('button', { name: 'Reach out to support', exact: true })).toBeHidden(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeHidden(),
        ]);
    });
});
