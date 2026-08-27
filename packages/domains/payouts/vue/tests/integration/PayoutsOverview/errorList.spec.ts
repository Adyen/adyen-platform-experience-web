import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render error message', async ({ page }) => {
        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your payouts.", { exact: true })).toBeVisible();
        await expect(page.getByText('Try refreshing the page or come back later.', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible();
    });
});
