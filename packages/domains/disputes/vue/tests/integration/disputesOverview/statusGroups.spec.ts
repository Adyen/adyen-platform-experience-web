import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Status groups', () => {
    test('should switch to the fraud alerts status group', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        const grid = page.getByRole('grid');

        await expect(page.getByText('Respond by').first()).toBeVisible();

        await page.getByRole('radio', { name: 'Fraud alerts' }).click();

        await expect(grid.getByRole('columnheader', { name: 'Reason', exact: true })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Total payment amount', exact: true })).toBeVisible();
    });

    test('should switch to the ongoing and closed status group', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('radio', { name: 'Ongoing & closed' }).click();

        await expect(page.getByText('Status').first()).toBeVisible();
    });
});
