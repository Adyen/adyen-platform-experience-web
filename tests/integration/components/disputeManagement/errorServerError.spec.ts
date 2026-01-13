import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--server-error';

test.describe('Error - Server Error', () => {
    test('should render an error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Dispute management')).toBeVisible();
        await expect(page.getByText('Something went wrong.')).toBeVisible();
        await expect(page.getByText('We could not load your dispute.')).toBeVisible();
        await expect(page.getByText('Contact support for help and share error code 7ac77fd1d7')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).not.toBeVisible();
    });

    test('should render "Reach out to support" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByText('The error code is 7ac77fd1d7')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
