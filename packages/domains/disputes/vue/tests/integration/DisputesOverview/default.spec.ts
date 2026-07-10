import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Default', () => {
    test('should render the title and status group tabs', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Disputes', { exact: true })).toBeVisible(),
            expect(page.getByRole('tab', { name: 'Chargebacks', exact: true })).toHaveAttribute('aria-selected', 'true'),
            expect(page.getByRole('tab', { name: 'Fraud alerts', exact: true })).toBeVisible(),
            expect(page.getByRole('tab', { name: 'Ongoing & closed', exact: true })).toBeVisible(),
            expect(page.getByRole('tab')).toHaveCount(3),
        ]);
    });

    test('should render the chargebacks columns and a populated list', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        const grid = page.getByRole('grid');

        await expect(grid.getByRole('columnheader', { name: 'Respond by', exact: true })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Opened on', exact: true })).toBeVisible();
        await expect(grid.getByRole('columnheader', { name: 'Disputed amount', exact: true })).toBeVisible();
        await expect(page.getByText('No chargebacks found')).toBeHidden();
    });
});
