import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory, setTime } from '../../../utils/utils';

const sharedAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

const sendRepaymentButtonAnalyticsEventProperties = {
    ...sharedAnalyticsEventProperties,
    subCategory: 'Grant active',
    label: 'Send repayment',
} as const;

const STORY_ID = 'mocked-capital-capital-overview--repayment-us';

test.describe('Repayment - US', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await setTime(page);
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render send repayment button', async ({ page }) => {
        const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();

        await Promise.all([
            // send repayment button is visible
            expect(sendRepaymentButton).toBeVisible(),
            expect(sendRepaymentButton).toHaveText('Send repayment'),
        ]);
    });

    test.describe('Send repayment view', () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();

            // switching to send repayment view
            await sendRepaymentButton.click();
            await expectAnalyticsEvents(analyticsEvents, [['Clicked button', sendRepaymentButtonAnalyticsEventProperties]]);
            await sendRepaymentButton.waitFor({ state: 'detached' });
        });

        test('should show repayment details after "Send repayment" button is clicked', async ({ page }) => {
            const dismissButton = page.getByRole('button', { name: 'Dismiss', exact: true }).first();
            const copyIconButtons = page.getByTestId('copyText');

            await Promise.all([
                expect(dismissButton).toBeVisible(),
                expect(page.getByText('Send repayment')).toBeVisible(),
                expect(page.getByText('Pay off your loan faster by making one-time payments.')).toBeVisible(),
                expect(page.getByText('Loan repayment bank account')).toBeVisible(),
                expect(copyIconButtons).toHaveCount(3),
                expect(page.getByText('Account number')).toBeVisible(),
                expect(page.getByText('123456789012')).toBeVisible(),
                expect(page.getByText('Routing number')).toBeVisible(),
                expect(page.getByText('012345678')).toBeVisible(),
                expect(page.getByText('Account owned by')).toBeVisible(),
                expect(page.getByText('Adyen N.V. San Francisco Branch', { exact: true }).first()).toBeVisible(),
                expect(page.getByText('Country/region')).toBeVisible(),
                expect(page.getByText('US', { exact: true })).toBeVisible(),
                expect(page.getByText('Your verified bank accounts')).toBeVisible(),
                expect(page.getByText('NL**INGB******8101')).toBeVisible(),
                expect(page.getByText('NL**INGB******4151')).toBeVisible(),
                expect(page.getByText('How to send a loan payment')).toBeVisible(),
                expect(page.getByText('Add Adyen N.V. San Francisco Branch as a payee using your bank’s website or app.')).toBeVisible(),
                expect(page.getByText('Send your payment.')).toBeVisible(),
                expect(page.getByText('Wait 1-3 business days for the payment to be applied to your loan.')).toBeVisible(),
                expect(page.getByText('Payments made from a verified account are usually applied faster.')).toBeVisible(),
            ]);
        });

        test('should return to grants list when send repayment dismiss button is clicked', async ({ page }) => {
            const dismissButton = page.getByRole('button', { name: 'Dismiss', exact: true }).first();

            // closing send repayment view
            await dismissButton.click();
            await dismissButton.waitFor({ state: 'detached' });

            // showing active grants list view
            const amountLabel = page.getByTestId('grant-amount-label').first();
            const progressBar = page.getByRole('progressbar').first();
            const sendRepaymentButton = page.getByRole('button', { name: 'Send repayment', exact: true }).first();
            const grantExpandButton = page.getByTestId('expand-button');

            await Promise.all([
                expect(amountLabel).toBeVisible(),
                expect(progressBar).toBeVisible(),
                expect(sendRepaymentButton).toBeVisible(),
                expect(grantExpandButton).toBeVisible(),
            ]);
        });
    });
});
