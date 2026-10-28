import { test, expect } from '@playwright/test';
import { getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-cashout-cashout-request--eligibility-error';

test.describe('CashOut Request - Error - Eligibility', () => {
    test.beforeEach(async ({ page }) => {
        await goToStory(page, { id: STORY_ID });
    });

    test('should show an error, keeping the balance account selector so another one can be selected', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('heading', { name: 'Instant CashOut request' })).toBeVisible(),
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(root.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
        ]);
    });

    test('should load the eligibility again on refresh', async ({ page }) => {
        const eligibilityRequest = page.waitForRequest(request => request.url().includes('/cashout/eligibility'));

        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await eligibilityRequest;
    });
});
