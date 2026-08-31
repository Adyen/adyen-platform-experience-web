import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-transactions-transactions-overview--overview-role-not-assigned';

test.describe('Error - Transactions Overview role not assigned', () => {
    test('Should display the unavailable error and not render the overview', async ({ page }) => {
        const domainRequests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/transactions') || request.url().includes('/balanceAccounts')) domainRequests.push(request.url());
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Something went wrong.').first()).toBeVisible();
        await expect(page.getByText("We couldn't load the transactions overview.")).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();

        await expect(page.getByRole('radio', { name: 'Transactions', exact: true })).toHaveCount(0);
        await expect(page.getByRole('grid')).toHaveCount(0);
        expect(domainRequests).toEqual([]);
    });
});
