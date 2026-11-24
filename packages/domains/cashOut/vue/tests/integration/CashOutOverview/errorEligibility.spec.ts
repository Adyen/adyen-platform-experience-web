import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { OVERVIEW_ANALYTICS } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--eligibility-error';

test.describe('CashOut Overview - Error - Eligibility', () => {
    // Tells which request kept the overview from loading, with its error
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Encountered error', { ...OVERVIEW_ANALYTICS, returnType: 'backend', returnValue: '500', request: 'eligibility' }],
        ]);
    });

    test('should show an error, keeping the balance account selector so another one can be selected', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByText('Something went wrong.')).toBeVisible(),
            expect(root.getByText("We couldn't load Instant CashOut. Try refreshing the page or come back later.")).toBeVisible(),
            expect(root.getByRole('button', { name: 'Refresh' })).toBeVisible(),
            expect(root.getByRole('combobox', { name: 'Balance account' })).toBeVisible(),
            expect(root.getByText('Available to cash out')).toHaveCount(0),
            expect(root.getByRole('button', { name: 'Start instant CashOut' })).toHaveCount(0),
        ]);
    });

    test('should load the eligibility again on refresh', async ({ page }) => {
        const eligibilityRequest = page.waitForRequest(request => request.url().includes('/cashout/eligibility'));

        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await eligibilityRequest;
    });
});
