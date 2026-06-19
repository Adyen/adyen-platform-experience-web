import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payouts-overview--error-list';

test.describe('Error - list', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render error message', async ({ page }) => {
        // [TODO]: Address displaying only primary error message, without title and action button
        test.fixme(true, 'Only displaying primary error message, without title and action button.');

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText("We couldn't load your payouts. Try refreshing the page or come back later.")).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible();
    });
});
