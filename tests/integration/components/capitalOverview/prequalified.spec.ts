import type { Page } from '@playwright/test';
import { test, expect, type PageAnalyticsEvent } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import {
    sharedCapitalOfferAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
    sharedPrequalifiedAnalyticsEventProperties,
} from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--prequalified';

const goToOfferSelection = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'See options' }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedPrequalifiedAnalyticsEventProperties, label: 'See options' }],
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

test.describe('Prequalified', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);
    });

    test('should render prequalified intro screen', async ({ page }) => {
        await expect(page.getByText('Need some extra money?')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('You have been pre-qualified for business financing up to €25,000.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'See options' })).toBeVisible();
    });

    test('should go to offer selection screen with "Back" button when "See options" button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelection(page, analyticsEvents);
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });

    test('should go back to prequalified intro screen when "Back" button in offer selection screen is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSelection(page, analyticsEvents);
        await page.getByRole('button', { name: 'Go back' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Duration', sharedCapitalOfferAnalyticsEventProperties],
            ['Duration', sharedCapitalOfferSelectionAnalyticsEventProperties],
            ['Landed on page', sharedPrequalifiedAnalyticsEventProperties],
        ]);

        await expect(page.getByText('Need some extra money?')).toBeVisible();
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
            ['Landed on page', { ...sharedPrequalifiedAnalyticsEventProperties, subCategory: 'Grants overview' }],
        ]);

        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
    });
});

test.describe('onFundsRequest argument', () => {
    test('should not go to grants screen when argument is set and when "Request funds" button in offer summary screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onFundsRequest: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

        await goToOfferSummary(page, analyticsEvents);
        await page.getByRole('button', { name: 'Request funds' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
        ]);

        await expect(page.getByText('Business financing', { exact: true })).toBeHidden();
    });
});

test.describe('onOfferDismiss argument', () => {
    test('should not go back to prequalified intro screen when argument is set and when "Back" button in offer selection screen is clicked', async ({
        page,
        analyticsEvents,
    }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferDismiss: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedPrequalifiedAnalyticsEventProperties]]);

        await goToOfferSelection(page, analyticsEvents);

        await page.getByRole('button', { name: 'Go back' }).click();
        await expectAnalyticsEvents(analyticsEvents, []);

        await expect(page.getByText('Need some extra money?')).toBeHidden();
    });
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

        await expect(page.getByText('Business financing offer')).toBeHidden();
    });
});

test.describe('skipPreQualifiedIntro argument', () => {
    test('should render offer selection screen without "Back" button when argument is set', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { skipPreQualifiedIntro: 'true' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }]]);
        await expect(page.getByText('Business financing offer')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeHidden();
    });
});
