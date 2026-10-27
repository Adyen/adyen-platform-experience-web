import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--ineligible';

test.describe('Ineligible', () => {
    test('should render ineligible screen', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedCapitalOverviewAnalyticsEventProperties]]);

        await Promise.all([
            expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
            expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible(),
            expect(page.getByText('No offer available currently')).toBeVisible(),
            expect(page.getByText('We update our financial offers regularly, so be sure to check back again in the future.')).toBeVisible(),
        ]);
    });
});

test.describe('mountIfIneligible argument', () => {
    test('should not render the component when argument is false', async ({ page }) => {
        await goToStory(page, { id: STORY_ID, args: { mountIfIneligible: 'false' } });
        await expect(page.getByText('Business financing')).toBeHidden();
    });
});
