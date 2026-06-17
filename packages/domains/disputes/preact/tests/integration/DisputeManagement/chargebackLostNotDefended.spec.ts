import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-lost-not-defended';

test.describe('Chargeback - Lost (Not defended)', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render chargeback lost alert message if not defended until deadline', async ({ page }) => {
        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await expect(page.getByText('Lost', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        await expect(page.getByText('This chargeback wasn’t defended and was lost by default.')).toBeVisible();
    });
});
