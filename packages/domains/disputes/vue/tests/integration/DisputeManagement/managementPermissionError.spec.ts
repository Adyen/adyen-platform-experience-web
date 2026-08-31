import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--management-role-not-assigned';

test.describe('Error - Dispute Management role not assigned', () => {
    test('Should display the unavailable error and not render the dispute details', async ({ page }) => {
        const domainRequests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/disputes') || request.url().includes('/balanceAccounts')) domainRequests.push(request.url());
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Something went wrong.').first()).toBeVisible();
        await expect(page.getByText('We could not load your dispute.')).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();

        await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
        expect(domainRequests).toEqual([]);
    });
});
