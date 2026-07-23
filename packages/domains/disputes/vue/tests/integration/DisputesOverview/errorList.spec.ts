import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--internal-server-error';

test.describe('Disputes Overview - Error list', () => {
    test('should render the list error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('We could not load your disputes.')).toBeVisible();
    });

    test('should render the contact support button when the callback is provided', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });

        await expect(page.getByText('We could not load your disputes.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Contact support' })).toBeVisible();
    });
});
