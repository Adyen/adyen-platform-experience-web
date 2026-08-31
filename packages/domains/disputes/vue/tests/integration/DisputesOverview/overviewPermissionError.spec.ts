import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-disputes-overview--overview-role-not-assigned';

test.describe('Error - Disputes Overview role not assigned', () => {
    test('Should display the unavailable error and not render the overview', async ({ page }) => {
        const domainRequests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/disputes') || request.url().includes('/balanceAccounts')) domainRequests.push(request.url());
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Something went wrong.').first()).toBeVisible();
        await expect(page.getByText('We could not load the disputes overview component')).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();

        await expect(page.getByRole('tab', { name: 'Chargebacks', exact: true })).toHaveCount(0);
        expect(domainRequests).toEqual([]);
    });
});
