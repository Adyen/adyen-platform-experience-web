import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--early-renewal-loan';

test.describe('Early renewal - Loan', () => {
    test('should render new loan alert in loans screen', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Landed on page',
                {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    hasGrants: true,
                    hasOffer: true,
                    isEarlyRenewal: true,
                },
            ],
        ]);

        await Promise.all([
            expect(page.getByText('You are now eligible to request a new loan up to €25,000')).toBeVisible(),
            expect(
                page.getByText(
                    'If you accept, a portion of your new loan will automatically be deducted to repay your remaining current loan, and any remaining fee on it will be waived.'
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new loan', exact: true })).toBeVisible(),
        ]);
    });
});
