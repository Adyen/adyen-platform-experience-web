import { test, expect } from '@playwright/test';
import { goToStory } from '../../../utils/utils';

const STORY_ID = 'mocked-disputes-dispute-management--unprocessable-entity-error';

test.describe('Error - Unprocessable entity', () => {
    test('should render an error message', async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
        await expect(page.getByText('Dispute management')).toBeVisible();
        await expect(page.getByText('Entity was not found')).toBeVisible();
        await expect(page.getByText('Dispute not found for the specified Account Holder')).toBeVisible();
    });

    test('should render "Reach out to support" button when argument is set', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { onContactSupport: 'Enabled' } });
        await expect(page.getByText('Entity was not found')).toBeVisible();
        await expect(page.getByText('Dispute not found for the specified Account Holder')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reach out to support' })).toBeVisible();
    });
});
