import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--first-time-eligible-loan';

test.describe('First-time eligible - Loan', () => {
    test('should render offer alert', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Landed on page',
                {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    hasGrants: false,
                    hasOffer: true,
                    isEarlyRenewal: false,
                },
            ],
        ]);

        await Promise.all([
            expect(page.getByText('You have been pre-qualified for business financing up to €25,000.')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a loan', exact: true })).toBeVisible(),
        ]);
    });
});
