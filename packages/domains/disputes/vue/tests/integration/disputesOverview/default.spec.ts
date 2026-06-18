import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--default';

test.describe('Disputes Overview - Default', () => {
    test('should render the title and the status group switcher', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await Promise.all([
            expect(page.getByText('Disputes', { exact: true })).toBeVisible(),
            expect(page.getByText('Chargebacks', { exact: true })).toBeVisible(),
            expect(page.getByText('Fraud alerts', { exact: true })).toBeVisible(),
            expect(page.getByText('Ongoing & closed', { exact: true })).toBeVisible(),
        ]);
    });

    test('should render the chargebacks columns and a populated list', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Respond by').first()).toBeVisible();
        await expect(page.getByText('Opened on').first()).toBeVisible();
        await expect(page.getByText('Disputed amount').first()).toBeVisible();
        await expect(page.getByText('No chargebacks found')).toBeHidden();
    });
});
