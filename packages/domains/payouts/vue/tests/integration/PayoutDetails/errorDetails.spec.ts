import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payout-details--error-details';

test.describe('Error - Details', () => {
    test('should render payout details error display', async ({ page }) => {
        // [TODO]: Address displaying only primary error message, without title and action button
        test.fixme(true, 'Only displaying primary error message, without title and action button.');

        await goToStory(page, { id: STORY_ID });

        const errorText = "We couldn't load the payout details. Try refreshing the page or come back later.";

        await expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible();
        await expect(page.getByText(errorText, { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible();
    });
});
