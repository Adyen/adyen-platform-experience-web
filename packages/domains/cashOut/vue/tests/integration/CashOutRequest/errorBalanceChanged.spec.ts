import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { REQUEST_ANALYTICS } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--balance-changed';

// The balance changed since what is available was shown, so cashout-ui rejects the cashOut for an amount above what is available by then
test.describe('CashOut Request - Error - Balance changed', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', REQUEST_ANALYTICS]]);
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await root.getByRole('button', { name: 'Cash out now' }).click();
    });

    test('should tell the available balance changed instead of that something went wrong, and offer to try again', async ({ page }) => {
        const alert = getComponentRoot(page).getByRole('alert');

        await Promise.all([
            expect(alert.getByText('Your balance changed', { exact: true })).toBeVisible(),
            expect(alert.getByText("You can't cash out this amount anymore. Try again to see what's available now.", { exact: true })).toBeVisible(),
            expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible(),
            expect(alert.getByText('Something went wrong')).toHaveCount(0),
        ]);
    });

    test('should show the form again with what is available by then once tried again', async ({ page }) => {
        const root = getComponentRoot(page);

        await root.getByRole('button', { name: 'Try again' }).click();

        await Promise.all([
            expect(root.getByText('You have $150.00 available to cash out')).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('150.00'),
            expect(root.getByRole('button', { name: 'Cash out now' })).toBeVisible(),
            expect(root.getByRole('alert')).toHaveCount(0),
        ]);
    });

    test('should tell the cashOut was rejected, and tried again', async ({ page, analyticsEvents }) => {
        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed bank account', REQUEST_ANALYTICS],
            ['Clicked button', { ...REQUEST_ANALYTICS, label: 'Cash out now' }],
            ['Encountered error', { ...REQUEST_ANALYTICS, returnType: 'backend', returnValue: '29_001', request: 'instruct' }],
        ]);

        await getComponentRoot(page).getByRole('button', { name: 'Try again' }).click();

        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...REQUEST_ANALYTICS, label: 'Try again', step: 'result' }]]);
    });
});
