import { test, expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedCapitalOverviewAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import type { Page } from '@playwright/test';
import {
    landedOnPageAnalyticsEventProperties,
    selectedRepaymentTermAnalyticsEventProperties,
    sliderChangedAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOffer/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--eligible';

const getOfferModal = (page: Page) => page.getByRole('dialog');

const openOfferAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Request a new loan' }).click();
    await expectAnalyticsEvents(
        analyticsEvents,
        [
            ['Clicked button', { ...sharedCapitalOverviewAnalyticsEventProperties, label: 'Open offer' }],
            ['Landed on page', landedOnPageAnalyticsEventProperties],
            ['Changed capital offer slider', sliderChangedAnalyticsEventProperties],
            ['Selected repayment term', selectedRepaymentTermAnalyticsEventProperties],
        ],
        { strictOrder: false }
    );
};

const goToOfferSummaryAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await openOfferAndExpectAnalytics(page, analyticsEvents);
    await getOfferModal(page).getByRole('button', { name: 'Review request' }).click();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
    ]);
};

test.describe('Eligible', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Landed on page',
                {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    hasGrants: true,
                    hasOffer: true,
                },
            ],
        ]);
    });

    test('should render new loan alert in grants screen', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
            expect(page.getByText('You are now eligible to request a new loan up to €25,000')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Request a new loan' })).toBeVisible(),
        ]);
    });

    test('should open offer in a modal when new loan button is clicked', async ({ page, analyticsEvents }) => {
        await openOfferAndExpectAnalytics(page, analyticsEvents);

        const offerModal = getOfferModal(page);

        await expect(offerModal).toBeVisible();
        await expect(offerModal.getByText('Business financing request')).toBeVisible();
    });

    test('should close offer modal and track dismissal when close button is clicked', async ({ page, analyticsEvents }) => {
        await openOfferAndExpectAnalytics(page, analyticsEvents);
        await getOfferModal(page).getByRole('button', { name: 'Close', exact: true }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOverviewAnalyticsEventProperties, label: 'Dismiss offer' }],
        ]);

        await expect(getOfferModal(page)).toBeHidden();
    });

    test('should close offer modal without tracking dismissal when request submit button in offer summary screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToOfferSummaryAndExpectAnalytics(page, analyticsEvents);
        await getOfferModal(page).getByRole('button', { name: 'Submit request (€13,000)' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
        ]);

        await expect(getOfferModal(page)).toBeHidden();
        await expect(page.getByRole('button', { name: 'Request a new loan' })).toBeHidden();
        await expect(page.getByText('In progress')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});
