import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--rfi-expired';

test.describe('Request for information - Expired', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should render expired alert message for expired RFI', async ({ page }) => {
        await expect(page.getByText('Request for information', { exact: true })).toBeVisible();
        await expect(page.getByText('Expired', { exact: true })).toBeVisible();

        await expect(page.getByRole('alert')).toBeVisible();

        await expect(page.getByText('This request for information wasn’t responded to and was lost by default.')).toBeVisible();
    });
});
