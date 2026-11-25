import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--early-renewal-cash-advance';

test.describe('Early renewal - Cash advance', () => {
    test('should offer a cash advance renewal rather than a loan renewal', async ({ page, analyticsEvents }) => {
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
            expect(page.getByText('You are now eligible to request a new advance up to £25,000')).toBeVisible(),
            expect(
                page.getByText(
                    'If you accept, a portion of your new advance will automatically be deducted to fulfill your remaining current advance, and any remaining fee on it will be waived.'
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new advance', exact: true })).toBeVisible(),
        ]);
    });
});
