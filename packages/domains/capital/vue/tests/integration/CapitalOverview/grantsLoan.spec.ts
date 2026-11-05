import type { Page } from '@playwright/test';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOverviewAnalyticsEventProperties,
    sharedSendRepaymentButtonAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grants-loan';

const getGrantDetailsToggle = (page: Page) => page.getByLabel('Show grant details').first();

test.describe('Grants - Loan', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedCapitalOverviewAnalyticsEventProperties]]);
    });

    test('should render grants screen with tabs', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Business financing')).toBeVisible(),
            expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible(),
            expect(page.getByRole('radio', { name: 'In progress' })).toBeVisible(),
            expect(page.getByRole('radio', { name: 'Closed' })).toBeVisible(),
            expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toHaveText('Send repayment'),
        ]);
    });

    test('should render in-progress grants when in-progress tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByRole('radio', { name: 'In progress' }).click();

        const progressBar = page.getByRole('progressbar').first();

        await Promise.all([
            expect(page.getByTestId('grant-amount-label').first()).toHaveText('Remaining'),
            expect(page.getByText('€8,220.00').first()).toBeVisible(),
            expect(page.getByText('Term ends: May 16, 2025').first()).toBeVisible(),
            expect(page.getByText('€12,000.00 of €20,220.00 repaid')).toBeVisible(),
            expect(progressBar).toHaveAttribute('aria-valuenow', '59.34718100890207'),
            expect(progressBar).toHaveAttribute('aria-valuemax', '100'),
            expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toBeVisible(),
            expect(getGrantDetailsToggle(page)).toBeVisible(),
        ]);
    });

    test('should show grant details when grant card is expanded', async ({ page }) => {
        await getGrantDetailsToggle(page).click();

        await Promise.all([
            expect(page.getByText('Your requested funds were: €20,000.00')).toBeVisible(),
            expect(page.getByText('Remaining amount')).toBeVisible(),
            expect(page.getByText('€8,130.00')).toBeVisible(),
            expect(page.getByText('Remaining fees')).toBeVisible(),
            expect(page.getByText('€90.00')).toBeVisible(),
            expect(page.getByText('Repaid amount')).toBeVisible(),
            expect(page.getByText('€11,870.00')).toBeVisible(),
            expect(page.getByText('Repaid fees')).toBeVisible(),
            expect(page.getByText('€130.00')).toBeVisible(),
            expect(page.getByText('Total repayment amount')).toBeVisible(),
            expect(page.getByText('€20,220.00', { exact: true })).toBeVisible(),
            expect(page.getByText('Total fees')).toBeVisible(),
            expect(page.getByText('€220.00', { exact: true })).toBeVisible(),
            expect(page.getByText('Daily repayment rate')).toBeVisible(),
            expect(page.getByText('11%')).toBeVisible(),
            expect(page.getByText('30-day repayment minimum')).toBeVisible(),
            expect(page.getByText('€800.00')).toBeVisible(),
            expect(page.getByText('Maximum repayment period')).toBeVisible(),
            expect(page.getByText('9 months')).toBeVisible(),
            expect(page.getByText('Expected repayment period')).toBeVisible(),
            expect(page.getByText('180 days (135 days left)')).toBeVisible(),
            expect(page.getByText('Grant ID').first()).toBeVisible(),
            expect(page.getByText('afedbe0e05e9')).toBeVisible(),
            expect(page.getByText('Account description')).toBeVisible(),
            expect(page.getByText('Primary balance account')).toBeVisible(),
            expect(page.getByText('Account ID')).toBeVisible(),
            expect(page.getByText('BA1234567')).toBeVisible(),
        ]);
    });

    test('should hide grant details when grant card is collapsed', async ({ page }) => {
        await getGrantDetailsToggle(page).click();
        await getGrantDetailsToggle(page).click();

        await expect(page.getByText('Your requested funds were: €20,000.00')).toBeHidden();
    });

    test('should show a tooltip when repayment-threshold info icon is hovered', async ({ page }) => {
        await getGrantDetailsToggle(page).click();
        await page.getByLabel('Minimum repayment every 30 days to repay the financing on time').hover();

        await expect(page.getByRole('tooltip', { name: 'Minimum repayment every 30 days to repay the financing on time' })).toBeVisible();
    });

    test('should show repayment details after send repayment button is clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Send repayment', exact: true }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', sharedSendRepaymentButtonAnalyticsEventProperties]]);

        const repaymentModal = page.getByRole('dialog');
        const copyIconButtons = repaymentModal.getByRole('button', { name: /^Copy (IBAN|account owner)$/ });

        await Promise.all([
            expect(repaymentModal.getByText('Pay off your loan faster by making one-time payments.')).toBeVisible(),
            expect(repaymentModal.getByText('Loan repayment bank account')).toBeVisible(),
            expect(copyIconButtons).toHaveCount(2),
            expect(repaymentModal.getByText('IBAN')).toBeVisible(),
            expect(repaymentModal.getByText('NL69 RABO 1319 7782 91')).toBeVisible(),
            expect(repaymentModal.getByText('Account owned by')).toBeVisible(),
            expect(repaymentModal.getByText('Adyen N.V.', { exact: true }).first()).toBeVisible(),
            expect(repaymentModal.getByText('Country/region')).toBeVisible(),
            expect(repaymentModal.getByText('NL', { exact: true })).toBeVisible(),
            expect(repaymentModal.getByText('Your verified bank accounts')).toBeVisible(),
            expect(repaymentModal.getByText('NL**INGB******8101')).toBeVisible(),
            expect(repaymentModal.getByText('NL**INGB******4151')).toBeVisible(),
            expect(repaymentModal.getByText('How to send a loan payment')).toBeVisible(),
            expect(repaymentModal.getByText('Add Adyen N.V. as a payee using your bank’s website or app.')).toBeVisible(),
            expect(repaymentModal.getByText('Send your payment.')).toBeVisible(),
            expect(repaymentModal.getByText('Wait 1-3 business days for the payment to be applied to your loan.')).toBeVisible(),
            expect(repaymentModal.getByText('Payments made from a verified account are usually applied faster.')).toBeVisible(),
        ]);
    });

    test('should return to grants list when send repayment dismiss button is clicked', async ({ page, analyticsEvents }) => {
        await page.getByRole('button', { name: 'Send repayment', exact: true }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', sharedSendRepaymentButtonAnalyticsEventProperties]]);

        const dismissButton = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });

        await dismissButton.click();
        await dismissButton.waitFor({ state: 'detached' });
        await Promise.all([
            expect(page.getByTestId('grant-amount-label').first()).toBeVisible(),
            expect(page.getByRole('progressbar').first()).toBeVisible(),
            expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toBeVisible(),
        ]);
    });

    test('should render closed grants when closed tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await Promise.all([
            expect(page.getByText('Requested funds', { exact: true })).toHaveCount(4),
            expect(page.getByText('€20,000.00')).toHaveCount(4),
            expect(page.getByText('Grant ID')).toHaveCount(4),
            expect(page.getByTestId('grant-id-copy-text')).toHaveCount(4),
            expect(page.getByText('Fully repaid')).toBeVisible(),
            expect(page.getByText('Revoked')).toBeVisible(),
            expect(page.getByText('Written off')).toBeVisible(),
            expect(page.getByText('Failed', { exact: true })).toBeVisible(),
            expect(page.getByRole('progressbar')).toBeHidden(),
            expect(page.getByRole('button', { name: 'Show grant details' })).toBeHidden(),
        ]);
    });

    test('should render a tooltip with the grant ID when "Grant ID" label is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Grant ID').last().hover();

        await expect(page.getByText('6d9d171783ba')).toBeVisible();
    });

    test('should render a tooltip when failed status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByLabel('Failed').hover();

        await expect(page.getByText("We couldn't process this request. Try again with a new offer.")).toBeVisible();
    });

    test('should render a tooltip when revoked status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Revoked').hover();

        await expect(page.getByText('You accepted but then returned these funds')).toBeVisible();
    });

    test('should render a tooltip when written-off status tag is hovered', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByText('Written off').hover();

        await expect(page.getByText('You accepted these funds but did not repay them')).toBeVisible();
    });
});
