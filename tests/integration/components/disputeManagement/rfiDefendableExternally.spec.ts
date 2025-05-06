import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-dispute-management--rfi-defendable-externally';

test.describe('Request for information - Defendable externally', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render a contact support alert when dispute is not defensable trough the component', async ({ page }) => {
        await expect(page.getByRole('alert')).toBeVisible();

        const icon = page.locator('.adyen-pe-alert__icon');
        await icon.waitFor();
        await expect(icon).toBeVisible();

        await expect(page.getByText('Contact support to respond to this request for information.')).toBeVisible();
        await expect(page.getByText('The response deadline is ')).toBeVisible();
    });
});
