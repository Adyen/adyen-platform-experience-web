import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-payouts-payout-details--details-role-not-assigned';

test.describe('Error - Payout Details role not assigned', () => {
    test('Should display the unavailable error and not render the details', async ({ page }) => {
        const domainRequests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/payouts') || request.url().includes('/balanceAccounts')) domainRequests.push(request.url());
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Something went wrong.').first()).toBeVisible();
        await expect(page.getByText("We couldn't load the payout details.")).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();

        await expect(page.getByText('Payout details', { exact: true })).toHaveCount(0);
        await expect(page.getByText('Net payout', { exact: true })).toHaveCount(0);
        expect(domainRequests).toEqual([]);
    });
});
