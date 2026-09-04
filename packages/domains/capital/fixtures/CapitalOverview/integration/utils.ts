import type { Page } from '@playwright/test';
import { type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents } from '@integration-components/testing/playwright';
import { sharedCapitalOfferSelectionAnalyticsEventProperties, sharedGrantsOverviewAnalyticsEventProperties } from '../constants/analytics';
import {
    landedOnPageAnalyticsEventProperties,
    selectedRepaymentTermAnalyticsEventProperties,
    sliderChangedAnalyticsEventProperties,
} from '../../CapitalOffer/constants/analytics';

export const goToOfferSelection = async (page: Page) => {
    await page.getByRole('button', { name: 'Request a new loan' }).click();
};

export const goToOfferSummary = async (page: Page) => {
    await page.getByRole('button', { name: 'Review request' }).click();
};

export const goToOfferSelectionAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await goToOfferSelection(page);
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

export const goToOfferSummaryAndExpectAnalytics = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await goToOfferSelectionAndExpectAnalytics(page, analyticsEvents);
    await goToOfferSummary(page);

    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
    ]);
};
