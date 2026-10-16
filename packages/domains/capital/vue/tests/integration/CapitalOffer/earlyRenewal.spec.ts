import type { Page } from '@playwright/test';
import { test, expect, type PageAnalyticsEvent } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '@integration-components/testing/playwright/utils';
import {
    changedOfferAmountAnalyticsEventProperties,
    changedOfferTermAnalyticsEventProperties,
    landedOnPageAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOffer/constants/analytics';

const STORY_ID = 'mocked-capital-capital-offer--early-renewal';

const goToOfferSummary = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Review request' }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review', isEarlyRenewal: true }],
    ]);
};

const expectPageLoadAnalyticsEvents = (analyticsEvents: PageAnalyticsEvent[]) =>
    expectAnalyticsEvents(analyticsEvents, [
        ['Landed on page', { ...landedOnPageAnalyticsEventProperties, isEarlyRenewal: true }],
        ['Changed offer amount', { ...changedOfferAmountAnalyticsEventProperties, min: 1220000, value: 1860000, isEarlyRenewal: true }],
        [
            'Changed offer term',
            {
                ...changedOfferTermAnalyticsEventProperties,
                availableRates: [1100, 1500],
                availableTerms: [180, 360],
                isEarlyRenewal: true,
            },
        ],
    ]);

test.describe('Early renewal', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectPageLoadAnalyticsEvents(analyticsEvents);
    });

    test('should render early renewal info in offer selection screen', async ({ page }) => {
        const newLoanField = page.getByText('New loan').locator('..');
        const currentLoanBalanceField = page.getByText('Current loan balance').locator('..');
        const amountToReceiveField = page.getByText("Amount you'll receive").locator('..');

        await Promise.all([
            expect(newLoanField).toBeVisible(),
            expect(newLoanField.getByText('€18,600')).toBeVisible(),
            expect(currentLoanBalanceField).toBeVisible(),
            expect(currentLoanBalanceField.getByText('€8,130')).toBeVisible(),
            expect(amountToReceiveField).toBeVisible(),
            expect(amountToReceiveField.getByText('€10,470')).toBeVisible(),
        ]);
    });

    test('should render early renewal info in offer summary screen', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        const offerSummary = page.getByTestId('capital-offer-summary');
        const newLoanField = offerSummary.getByText('New loan').first().locator('..');
        const currentLoanBalanceField = offerSummary.getByText('Current loan balance').locator('..');
        const amountToReceiveField = offerSummary.getByText("Amount you'll receive").locator('..');

        await Promise.all([
            expect(newLoanField).toBeVisible(),
            expect(newLoanField.getByText('€18,600')).toBeVisible(),
            expect(currentLoanBalanceField).toBeVisible(),
            expect(currentLoanBalanceField.getByText('€8,130')).toBeVisible(),
            expect(amountToReceiveField).toBeVisible(),
            expect(amountToReceiveField.getByText('€10,470')).toBeVisible(),
        ]);
        await expect(offerSummary.getByRole('tab', { name: 'New loan' })).toBeVisible();
        await expect(offerSummary.getByRole('tab', { name: 'Current loan' })).toBeVisible();
        await expect(offerSummary.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(offerSummary.getByText('€18,600.00')).toBeVisible();
        await expect(offerSummary.getByText('Fees', { exact: true })).toHaveCount(2);
        await expect(offerSummary.getByText('€2,046.00')).toBeVisible();
        await expect(offerSummary.getByText('Total repayment amount')).toHaveCount(2);
        await expect(offerSummary.getByText('€20,646.00')).toBeVisible();
        await expect(offerSummary.getByText('Daily repayment rate')).toBeVisible();
        await expect(offerSummary.getByText('11%')).toBeVisible();
        await expect(offerSummary.getByText('30-day repayment minimum')).toBeVisible();
        await expect(offerSummary.getByText('€3,441.00')).toBeVisible();
        await expect(offerSummary.getByText('Expected repayment period')).toBeVisible();
        await expect(offerSummary.getByText('6 months')).toBeVisible();
        await expect(offerSummary.getByText('Maximum repayment date')).toBeVisible();
        await expect(offerSummary.getByText('Sep 28, 2025')).toBeVisible();
        await expect(offerSummary.getByText('Account', { exact: true })).toBeVisible();
        await expect(offerSummary.getByText('Primary account')).toBeVisible();
        await expect(
            offerSummary.getByText(
                'The terms and conditions of a new loan are separate from those of your existing loan, including, but not limited to, the repayment schedule, fees, and other material provisions. Carefully review all documentation associated with this new loan before accepting it.'
            )
        ).toBeVisible();
        await expect(
            offerSummary.getByText(
                'You may choose to retain your existing loan under its current terms. If you accept the new loan, a portion of the new amount will be applied to payoff your current loan. Your existing loan will be Repaid in accordance with its terms.'
            )
        ).toBeVisible();
    });

    test('should switch to new loan tab when the latter is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        const offerSummary = page.getByTestId('capital-offer-summary');

        await offerSummary.getByRole('tab', { name: 'Current loan' }).click();
        await offerSummary.getByRole('tab', { name: 'New loan' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Moved tabs', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, selectedTab: 'Current loan' }],
            ['Moved tabs', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, selectedTab: 'New loan' }],
        ]);
        await expect(offerSummary.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(offerSummary.getByText('€18,600.00')).toBeVisible();
    });

    test('should switch to current loan tab when the latter is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        const offerSummary = page.getByTestId('capital-offer-summary');

        await offerSummary.getByRole('tab', { name: 'Current loan' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Moved tabs', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, selectedTab: 'Current loan' }],
        ]);
        await expect(offerSummary.getByText('Financing', { exact: true })).toHaveCount(2);
        await expect(offerSummary.getByText('€20,000.00')).toBeVisible();
        await expect(offerSummary.getByText('Fees', { exact: true })).toHaveCount(2);
        await expect(offerSummary.getByText('€220.00')).toBeVisible();
        await expect(offerSummary.getByText('Total repayment amount')).toHaveCount(2);
        await expect(offerSummary.getByText('€20,220.00')).toBeVisible();
        await expect(offerSummary.getByText('Daily repayment rate')).toBeVisible();
        await expect(offerSummary.getByText('15%')).toBeVisible();
        await expect(offerSummary.getByText('30-day repayment minimum')).toBeVisible();
        await expect(offerSummary.getByText('€800.00')).toBeVisible();
        await expect(offerSummary.getByText('Expected repayment period')).toBeVisible();
        await expect(offerSummary.getByText('12 months')).toBeVisible();
        await expect(offerSummary.getByText('Maximum repayment date')).toBeVisible();
        await expect(offerSummary.getByText('Mar 27, 2026')).toBeVisible();
        await expect(offerSummary.getByText('Account', { exact: true })).toBeVisible();
        await expect(offerSummary.getByText('Primary account')).toBeVisible();
    });
});
