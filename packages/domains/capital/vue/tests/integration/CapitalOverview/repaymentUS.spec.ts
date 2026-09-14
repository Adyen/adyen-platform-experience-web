import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, setTime } from '@integration-components/testing/playwright/utils';
import {
    sharedCapitalOverviewAnalyticsEventProperties,
    sharedSendRepaymentButtonAnalyticsEventProperties,
} from '../../../../fixtures/CapitalOverview/constants/analytics';
import type { Page } from '@playwright/test';

const STORY_ID = 'mocked-capital-capital-overview--repayment-us';

const getRepaymentModal = (page: Page) => page.getByRole('dialog');

test.describe('Repayment US', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedCapitalOverviewAnalyticsEventProperties]]);
    });

    test('should render send repayment button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toHaveText('Send repayment');
    });

    test.describe('Send repayment view', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await page.getByRole('button', { name: 'Send repayment', exact: true }).click();
            await expectAnalyticsEvents(analyticsEvents, [['Clicked button', sharedSendRepaymentButtonAnalyticsEventProperties]]);
        });

        test('should show repayment details after "Send repayment" button is clicked', async ({ page }) => {
            const copyIconButtons = getRepaymentModal(page).getByRole('button', { name: /^Copy (account number|routing number|account owner)$/ });

            await Promise.all([
                expect(getRepaymentModal(page).getByText('Send repayment')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Pay off your loan faster by making one-time payments.')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Loan repayment bank account')).toBeVisible(),
                expect(copyIconButtons).toHaveCount(3),
                expect(getRepaymentModal(page).getByText('Account number')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('123456789012')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Routing number')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('012345678')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Account owned by')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Adyen N.V. San Francisco Branch', { exact: true }).first()).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Country/region')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('US', { exact: true })).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Your verified bank accounts')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('NL**INGB******8101')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('NL**INGB******4151')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('How to send a loan payment')).toBeVisible(),
                expect(
                    getRepaymentModal(page).getByText('Add Adyen N.V. San Francisco Branch as a payee using your bank’s website or app.')
                ).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Send your payment.')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Wait 1-3 business days for the payment to be applied to your loan.')).toBeVisible(),
                expect(getRepaymentModal(page).getByText('Payments made from a verified account are usually applied faster.')).toBeVisible(),
            ]);
        });

        test('should return to grants list when send repayment dismiss button is clicked', async ({ page }) => {
            const dismissButton = getRepaymentModal(page).getByRole('button', { name: 'Close', exact: true });

            await dismissButton.click();
            await dismissButton.waitFor({ state: 'detached' });
            await Promise.all([
                expect(page.getByTestId('grant-amount-label').first()).toBeVisible(),
                expect(page.getByRole('progressbar').first()).toBeVisible(),
                expect(page.getByRole('button', { name: 'Send repayment', exact: true }).first()).toBeVisible(),
                expect(page.getByRole('button', { name: 'Show grant details' }).first()).toBeVisible(),
            ]);
        });
    });
});
