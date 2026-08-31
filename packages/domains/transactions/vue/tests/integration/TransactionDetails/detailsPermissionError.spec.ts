import { test, expect } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-transactions-transaction-details--details-role-not-assigned';

test.describe('Error - Transaction Details role not assigned', () => {
    test('Should display the unavailable error and not render the details', async ({ page }) => {
        const domainRequests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('/transactions') || request.url().includes('/balanceAccounts')) domainRequests.push(request.url());
        });

        await goToStory(page, { id: STORY_ID });

        await expect(page.getByText('Something went wrong.').first()).toBeVisible();
        await expect(page.getByText("We couldn't load the transaction details.")).toBeVisible();
        await expect(page.getByText('Contact support for help.')).toBeVisible();

        await expect(page.getByText('Transaction details', { exact: true })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Refund payment', exact: true })).toHaveCount(0);
        expect(domainRequests).toEqual([]);
    });
});
