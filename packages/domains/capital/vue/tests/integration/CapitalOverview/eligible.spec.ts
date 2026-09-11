import { test, expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedGrantsOverviewAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import type { Page } from '@playwright/test';
import {
    landedOnPageAnalyticsEventProperties,
    selectedRepaymentTermAnalyticsEventProperties,
    sliderChangedAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOffer/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--eligible';

const goToOfferSelectionAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Request a new loan' }).click();
    await expectAnalyticsEvents(
        analyticsEvents,
        [
            ['Clicked button', { ...sharedGrantsOverviewAnalyticsEventProperties, label: 'Request a new loan' }],
            ['Landed on page', landedOnPageAnalyticsEventProperties],
            ['Changed capital offer slider', sliderChangedAnalyticsEventProperties],
            ['Selected repayment term', selectedRepaymentTermAnalyticsEventProperties],
        ],
        { strictOrder: false }
    );
};

const goToOfferSummaryAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
    await page.getByRole('button', { name: 'Review request' }).click();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
    ]);
};

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

    test('should go to offer selection screen with back button when new loan button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to grants screen when back button in offer selection screen is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
        await page.getByRole('button', { name: 'Go back' }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
    });

    test('should go to grants screen and show a new grant when request submit button in offer summary screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
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
    });
});
