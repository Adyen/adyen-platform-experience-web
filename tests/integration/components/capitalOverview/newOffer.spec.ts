import type { Page } from '@playwright/test';
import { test, expect, type PageAnalyticsEvent } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';

const sharedGrantsOverviewAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

const sharedCapitalOfferAnalyticsEventProperties = {
    componentName: 'capitalOffer',
    category: 'Capital offer component',
    subCategory: 'Capital offer',
} as const;

const sharedCapitalOfferSelectionAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

const sharedCapitalOfferSummaryAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing summary',
} as const;

const STORY_ID = 'mocked-capital-capital-overview--new-offer';

const goToOfferSelection = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'See new offer' }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedGrantsOverviewAnalyticsEventProperties, label: 'See new offer' }],
        ['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }],
    ]);
};

const goToOfferSummary = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await goToOfferSelection(page, analyticsEvents);
    await page.getByRole('button', { name: 'Review offer' }).click();

    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
        ['Duration', sharedCapitalOfferSelectionAnalyticsEventProperties],
    ]);
};

test.describe('New offer', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render "See new offer" button in grants screen', async ({ page }) => {
        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'See new offer' })).toBeVisible();
    });

    test('should go to offer selection screen with "Back" button when "See new offer" button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelection(page, analyticsEvents);
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to grants screen when "Back" button in offer selection screen is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelection(page, analyticsEvents);
        await page.getByRole('button', { name: 'Go back' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Duration', sharedCapitalOfferAnalyticsEventProperties],
            ['Duration', sharedCapitalOfferSelectionAnalyticsEventProperties],
            ['Landed on page', sharedGrantsOverviewAnalyticsEventProperties],
        ]);

        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
    });

    test('should go to grants screen and show a new grant when "Request funds" button in offer summary screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToOfferSummary(page, analyticsEvents);
        await page.getByRole('button', { name: 'Request funds' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
            ['Duration', sharedCapitalOfferAnalyticsEventProperties],
            ['Duration', sharedCapitalOfferSummaryAnalyticsEventProperties],
            ['Landed on page', { ...sharedGrantsOverviewAnalyticsEventProperties, subCategory: 'Grants overview' }],
        ]);

        await expect(page.getByText('Business financing', { exact: true })).toBeVisible();
        await expect(page.getByText('In progress')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});

test.describe('onFundsRequest argument', () => {
    test('should not go to grants screen when argument is set and "Request funds" button in offer summary screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);

        await goToOfferSummary(page, analyticsEvents);
        await page.getByRole('button', { name: 'Request funds' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
        ]);

        await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
    });
});
