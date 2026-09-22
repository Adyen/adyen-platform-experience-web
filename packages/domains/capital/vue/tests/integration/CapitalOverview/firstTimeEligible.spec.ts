import { test, expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedCapitalOverviewAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import {
    landedOnPageAnalyticsEventProperties,
    selectedRepaymentTermAnalyticsEventProperties,
    sliderChangedAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOffer/constants/analytics';
import type { Page } from '@playwright/test';

const STORY_ID = 'mocked-capital-capital-overview--first-time-eligible';

const getOfferButton = (page: Page) => page.getByTestId('capital-header').getByRole('button', { name: 'Request a new loan' });

const getOfferModal = (page: Page) => page.getByRole('dialog');

const openOfferAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await getOfferButton(page).click();
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

test.describe('First-time eligible', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Landed on page',
                {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    hasOffer: true,
                },
            ],
        ]);
    });

    test('should render offer alert', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Business financing', { exact: true })).toBeVisible(),
            expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible(),
            expect(page.getByText('You have been pre-qualified for business financing up to €25,000.')).toBeVisible(),
            expect(getOfferButton(page)).toBeVisible(),
        ]);
    });

    test('should open offer in a modal when options button is clicked', async ({ page, analyticsEvents }) => {
        await openOfferAndExpectAnalytics(page, analyticsEvents);
        await expect(getOfferModal(page)).toBeVisible();
        await expect(getOfferModal(page).getByText('Business financing request')).toBeVisible();
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
        await expect(page.getByText('Pending')).toBeVisible();
        await expect(page.getByRole('button', { name: 'See options' })).toBeHidden();
    });
});
