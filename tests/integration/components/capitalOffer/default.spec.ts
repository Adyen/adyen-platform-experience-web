import type { Page } from '@playwright/test';
import { test, expect, type PageAnalyticsEvent } from '../../../fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '../../../utils/utils';
import {
    sharedCapitalOfferAnalyticsEventProperties,
    sharedCapitalOfferSelectionAnalyticsEventProperties,
    sharedCapitalOfferSummaryAnalyticsEventProperties,
} from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-offer--default';

const goToOfferSummary = async (page: Page, analyticsEvents: PageAnalyticsEvent[]) => {
    await page.getByRole('button', { name: 'Review request' }).click();
    await expectAnalyticsEvents(analyticsEvents, [
        ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
    ]);
};

test.describe('Default', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }]]);
    });

    test('should render offer selection screen', async ({ page }) => {
        await expect(page.getByText('Business financing request')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('Select the amount for the loan')).toBeVisible();
        await expect(page.getByText('€12,500')).toBeVisible();
        await expect(page.getByRole('slider')).toBeVisible();
        await expect(page.getByText('min', { exact: true })).toBeVisible();
        await expect(page.getByText('€1,000')).toBeVisible();
        await expect(page.getByText('max', { exact: true })).toBeVisible();
        await expect(page.getByText('€25,000')).toBeVisible();
        await expect(page.getByText('Select a repayment plan')).toBeVisible();
        await expect(page.getByText('3 months')).toBeVisible();
        await expect(page.getByText('8% daily rate')).toBeVisible();
        await expect(page.getByText('6 months')).toBeVisible();
        await expect(page.getByText('11% daily rate')).toBeVisible();
        await expect(page.getByText('12 months')).toBeVisible();
        await expect(page.getByText('15% daily rate')).toBeVisible();
        await expect(page.getByText('Financing terms')).toBeVisible();
        await expect(page.getByText('Fees')).toBeVisible();
        await expect(page.getByText('€1,375.00')).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toBeVisible();
        await expect(page.getByText('€13,875.00')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%', { exact: true })).toBeVisible();
        await expect(page.getByText('Maximum repayment date')).toBeVisible();
        await expect(page.getByText('Sep 28, 2025')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Review request' })).toBeVisible();
    });

    test('should update offer details when slider value is changed', async ({ page, analyticsEvents }) => {
        const slider = page.getByRole('slider');
        await slider.focus();
        await page.keyboard.press('Home');

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Changed capital offer slider',
                {
                    ...sharedCapitalOfferSelectionAnalyticsEventProperties,
                    label: 'Slider changed',
                    currency: 'EUR',
                    value: 100000,
                },
            ],
        ]);

        await expect(page.getByRole('status')).toHaveText('€1,000');
        await expect(page.getByText('€110.00')).toBeVisible();
        await expect(page.getByText('€1,110.00')).toBeVisible();
    });

    test('should update terms when slider value is changed', async ({ page }) => {
        const slider = page.getByRole('slider');
        await slider.focus();
        await page.keyboard.press('Home');

        await expect(page.getByRole('radio', { name: /3 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /6 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /12 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /12 months/ })).toHaveAttribute('aria-disabled', 'true');

        await slider.focus();
        await page.keyboard.press('End');

        await expect(page.getByRole('radio', { name: /3 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /3 months/ })).toHaveAttribute('aria-disabled', 'true');
        await expect(page.getByRole('radio', { name: /6 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /12 months/ })).toBeVisible();
    });

    test('should update offer details when term selector value is changed', async ({ page, analyticsEvents }) => {
        await page.getByRole('radio', { name: '3 months 8% daily rate' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Selected repayment term',
                {
                    ...sharedCapitalOfferSelectionAnalyticsEventProperties,
                    label: 'Term selected',
                    value: 90,
                },
            ],
        ]);

        await expect(page.getByText('€1,000.00')).toBeVisible();
        await expect(page.getByText('€13,500.00')).toBeVisible();
        await expect(page.getByText('8%', { exact: true })).toBeVisible();
        await expect(page.getByText('Jun 30, 2025')).toBeVisible();
    });

    test('should go to offer summary screen when "Review request" button is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        await expect(page.getByText('Business financing summary')).toBeVisible();
    });

    test('should show the last selected amount and term when navigating back to offer selection screen', async ({ page }) => {
        const slider = page.getByRole('slider');
        await slider.focus();
        await page.keyboard.press('Home');
        await page.getByRole('radio', { name: '3 months 8% daily rate' }).click();
        await page.getByRole('button', { name: 'Review request' }).click();
        await page.getByRole('button', { name: 'Go back' }).click();

        await expect(page.getByRole('status')).toHaveText('€1,000');
        await expect(page.getByRole('radio', { name: /3 months/ })).toBeVisible();
        await expect(page.getByRole('radio', { name: /3 months/ })).toHaveAttribute('aria-checked', 'true');
    });

    test('should render offer summary screen', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        await expect(page.getByText('Business financing summary')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByText('€12,500', { exact: true })).toBeVisible();
        await expect(page.getByText('Financing', { exact: true })).toBeVisible();
        await expect(page.getByText('€1,375')).toBeVisible();
        await expect(page.getByText('Fees')).toBeVisible();
        await expect(page.getByText('€13,875', { exact: true })).toBeVisible();
        await expect(page.getByText('Total repayment amount')).toBeVisible();
        await expect(page.getByText('Financing terms')).toBeVisible();
        await expect(page.getByText('Daily repayment rate')).toBeVisible();
        await expect(page.getByText('11%')).toBeVisible();
        await expect(page.getByText('30-day repayment minimum')).toBeVisible();
        await expect(page.getByText('€2,312.50', { exact: true })).toBeVisible();
        await expect(page.getByText('Expected repayment period')).toBeVisible();
        await expect(page.getByText('6 months')).toBeVisible();
        await expect(page.getByText('Maximum repayment date')).toBeVisible();
        await expect(page.getByText('Sep 28, 2025')).toBeVisible();
        await expect(page.getByText('Account', { exact: true })).toBeVisible();
        await expect(page.getByText('Primary account')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit request (€12,500)' })).toBeVisible();
    });

    test('should show a tooltip when "30-day repayment minimum" label is hovered', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        await page.getByText('30-day repayment minimum').hover();
        const tooltip = page.getByText('Minimum repayment every 30 days to repay the financing on time');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should go back to offer selection screen when back button in offer summary screen is clicked', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        await page.getByRole('button', { name: 'Go back' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Back to slider view' }],
        ]);

        await expect(page.getByText('Business financing request')).toBeVisible();
    });

    test('should disable request submit button after funds request call succeeds', async ({ page, analyticsEvents }) => {
        await goToOfferSummary(page, analyticsEvents);
        const requestFundsButton = page.getByRole('button', { name: 'Submit request (€12,500)' });
        await requestFundsButton.click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSummaryAnalyticsEventProperties, label: 'Request funds' }],
        ]);

        await expect(requestFundsButton).toBeDisabled();
    });
});

test.describe('onOfferDismiss argument', () => {
    test('should render back button when argument is set', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferDismiss: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }]]);
        await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
    });
});

test.describe('onOfferSelect argument', () => {
    test('should not go to offer summary screen when argument is set', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { onOfferSelect: 'Enabled' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }]]);

        await page.getByRole('button', { name: 'Review request' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...sharedCapitalOfferSelectionAnalyticsEventProperties, label: 'Review offer' }],
        ]);

        await expect(page.getByText('Business financing summary')).toBeHidden();
    });
});

test.describe('legalEntity from the US', () => {
    test('should render right legal text with email link', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID, args: { ['legalEntity.countryCode']: 'US' } });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', { ...sharedCapitalOfferAnalyticsEventProperties, label: 'Capital offer' }]]);
        await goToOfferSummary(page, analyticsEvents);

        // Verify creditor and address
        await expect(page.getByText('Creditor: Adyen N.V. – San Francisco Branch')).toBeVisible();
        await expect(page.getByText('505 Brannan Street, San Francisco, CA 94107.')).toBeVisible();

        // Assert the paragraph is present
        const legalParagraph = page.getByText('If your application for business credit is denied');
        await expect(legalParagraph).toBeVisible();

        // Locate the link inside the paragraph
        const emailLink = legalParagraph.getByRole('link', {
            name: 'capital-support@adyen.com',
        });

        // Assertions on the link
        await expect(emailLink).toBeVisible();
        await expect(emailLink).toHaveAttribute('href', 'mailto:capital-support@adyen.com');

        // Verify address
        await expect(legalParagraph).toContainText(
            'Office of the Comptroller of the Currency (OCC), Customer Assistance Group, PO Box 53570, Houston, TX 77052.'
        );
    });
});
