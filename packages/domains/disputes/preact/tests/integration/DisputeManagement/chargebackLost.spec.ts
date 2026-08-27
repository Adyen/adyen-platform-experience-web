import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-lost';

test.describe('Chargeback - Lost', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render chargeback lost', async ({ page }) => {
        await expect(page.getByText('Chargeback', { exact: true })).toBeVisible();
        await expect(page.getByText('Lost', { exact: true })).toBeVisible();
    });
});
