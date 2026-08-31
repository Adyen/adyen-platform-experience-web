import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedGrantsOverviewAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import { goToOfferSelectionAndExpectAnalytics, goToOfferSummaryAndExpectAnalytics } from '../../../../fixtures/CapitalOverview/integration/utils';

const STORY_ID = 'mocked-capital-capital-overview--eligible';

test.describe('Eligible', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render new loan alert in grants screen', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
            expect(page.getByText('You are now eligible to request a new loan up to €25,000')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new loan' })).toBeVisible(),
        ]);
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go to offer selection screen with "Back" button when new loan button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go back to grants screen when "Back" button in offer selection screen is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
        await page.getByRole('button', { name: 'Go back' }).click();

        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);

        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should go to grants screen and show a new grant when request submit button in offer summary screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToOfferSummaryAndExpectAnalytics(page, analyticsEvents);
            await page.getByRole('button', { name: 'Submit request (€13,000)' }).click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
                ['Landed on page', { ...sharedGrantsOverviewAnalyticsEventProperties, subCategory: 'Grants overview' }],
            ]);

            await Promise.all([
                expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
                expect(page.getByText('In progress')).toBeVisible(),
                expect(page.getByText('Pending')).toBeVisible(),
            ]);
        }
    );
});

test.describe('onFundsRequest argument', () => {
    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should not go to grants screen when argument is set and request submit button in offer summary screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
            await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);

            await goToOfferSummaryAndExpectAnalytics(page, analyticsEvents);
            await page.getByRole('button', { name: 'Submit request (€13,000)' }).click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
            ]);

            await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
        }
    );
});
