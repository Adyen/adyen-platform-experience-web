import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedAnalyticsEventProperties } from './shared/constants';

const STORY_ID = 'mocked-transactions-transactions-insights--error-totals';

test.describe('Error - Totals', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render totals error display', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Something went wrong.', { exact: true })).toBeVisible(),
            expect(page.getByText('Try refreshing the page or come back later.')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Refresh', exact: true, disabled: false })).toBeVisible(),
        ]);
    });

    test('should refresh totals', async ({ page }) => {
        const refreshButton = page.getByRole('button', { name: 'Refresh', exact: true, disabled: false });
        const totalsRequest = page.waitForRequest(request => request.url().includes('/transactions/totals'));
        await refreshButton.click();
        await totalsRequest;
    });
});
