import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedPrequalifiedAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import {
    landedOnPageAnalyticsEventProperties,
    selectedRepaymentTermAnalyticsEventProperties,
    sliderChangedAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOffer/constants/analytics';
import { goToOfferSelectionAndExpectAnalytics, goToOfferSummaryAndExpectAnalytics } from '../../../../fixtures/CapitalOverview/integration/utils';

const STORY_ID = 'mocked-capital-capital-overview--first-time-eligible';

test.describe('First-time eligible', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);
    });

    test('should render prequalified intro screen', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Need some extra money?')).toBeVisible(),
            expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible(),
            expect(page.getByText('You have been pre-qualified for business financing up to €25,000.')).toBeVisible(),
            expect(page.getByRole('button', { name: 'See options' })).toBeVisible(),
        ]);
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should go to offer selection screen with "Back" button when "See options" button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should go back to prequalified intro screen when "Back" button in offer selection screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
            await page.getByRole('button', { name: 'Go back' }).click();

            await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

            await expect(page.getByText('Need some extra money?')).toBeVisible();
        }
    );

    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should go to grants screen and show a new grant when request submit button in offer summary screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToOfferSummaryAndExpectAnalytics(page, analyticsEvents);
            await page.getByRole('button', { name: 'Submit request (€13,000)' }).click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
                ['Landed on page', { ...sharedPrequalifiedAnalyticsEventProperties, subCategory: 'Grants overview' }],
            ]);

            await Promise.all([expect(page.getByText('Business financing')).toBeVisible(), expect(page.getByText('Pending')).toBeVisible()]);
        }
    );
});

test.describe('onFundsRequest argument', () => {
    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should not go to grants screen when argument is set and when request submit button in offer summary screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
            await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

            await goToOfferSummaryAndExpectAnalytics(page, analyticsEvents);
            await page.getByRole('button', { name: 'Submit request (€13,000)' }).click();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
            ]);

            await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
        }
    );
});

test.describe('onOfferDismiss argument', () => {
    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme(
        'should not go back to prequalified intro screen when argument is set and when "Back" button in offer selection screen is clicked',
        async ({ page, analyticsEvents }) => {
            await goToStory(page, { id: STORY_ID, args: { onOfferDismiss: 'Enabled' } });
            await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

            await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);

            await page.getByRole('button', { name: 'Go back' }).click();
            await expectAnalyticsEvents(analyticsEvents, []);

            await expect(page.getByText('Need some extra money?')).toBeHidden();
        }
    );
});

test.describe('onOfferOptionsRequest argument', () => {
    test('should not go to offer selection screen when argument is set and when "See options" button is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferOptionsRequest: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

        await page.getByRole('button', { name: 'See options' }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...sharedPrequalifiedAnalyticsEventProperties, label: 'See options' }]]);

        await expect(page.getByText('Business financing request')).toBeHidden();
    });
});

test.describe('skipPreQualifiedIntro argument', () => {
    // TODO: Enable when the Vue Capital Offer component is implemented.
    test.fixme('should render offer selection screen without "Back" button when argument is set', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { skipPreQualifiedIntro: 'true' } });
        await expectAnalyticsEvents(
            analyticsEvents,
            [
                ['Landed on page', landedOnPageAnalyticsEventProperties],
                ['Changed capital offer slider', sliderChangedAnalyticsEventProperties],
                ['Selected repayment term', selectedRepaymentTermAnalyticsEventProperties],
            ],
            { strictOrder: false }
        );
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeHidden();
    });
});
