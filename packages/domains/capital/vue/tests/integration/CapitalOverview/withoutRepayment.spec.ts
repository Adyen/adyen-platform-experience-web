import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--without-repayment';

test.describe('Without repayment', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedCapitalOverviewAnalyticsEventProperties]]);
    });

    test('should render active grant without send repayment button', async ({ page }) => {
        await Promise.all([
            expect(page.getByTestId('grant-amount-label').first()).toBeVisible(),
            expect(page.getByRole('progressbar').first()).toBeVisible(),
            expect(page.getByRole('button', { name: 'Send repayment', exact: true })).toHaveCount(0),
        ]);
    });
});
