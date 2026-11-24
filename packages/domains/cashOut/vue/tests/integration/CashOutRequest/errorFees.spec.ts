import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { REQUEST_ANALYTICS } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--fees-error';

test.describe('CashOut Request - Error - Fees', () => {
    // Lands, then tells the fees failed to load, with their error
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Landed on page', { ...REQUEST_ANALYTICS, isAvailable: true }],
            ['Encountered error', { ...REQUEST_ANALYTICS, returnType: 'backend', returnValue: '500', request: 'fees' }],
        ]);
    });

    test('should show an error instead of the form, keeping the balance account selector', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(root.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
        ]);
    });

    test('should load the fees again on refresh', async ({ page }) => {
        const feesRequest = page.waitForRequest(request => request.url().includes('/cashout/fees'));

        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await feesRequest;
    });
});
