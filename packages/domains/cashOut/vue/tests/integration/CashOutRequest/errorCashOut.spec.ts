import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { REQUEST_ANALYTICS } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--cash-out-error';

test.describe('CashOut Request - Error - Cash out', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', REQUEST_ANALYTICS]]);
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await root.getByRole('button', { name: 'Cash out now' }).click();
    });

    test('should show the error screen instead of the form', async ({ page }) => {
        const root = getComponentRoot(page);

        await Promise.all([
            expect(root.getByRole('alert').getByText('Something went wrong', { exact: true })).toBeVisible(),
            expect(root.getByRole('alert').getByText('Please try again', { exact: true })).toBeVisible(),
            expect(root.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveCount(0),
            expect(root.getByText('CashOut successful')).toHaveCount(0),
        ]);
    });

    test('should tell the cashOut was sent, and failed with its error', async ({ analyticsEvents }) => {
        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed bank account', REQUEST_ANALYTICS],
            ['Clicked button', { ...REQUEST_ANALYTICS, label: 'Cash out now' }],
            ['Encountered error', { ...REQUEST_ANALYTICS, returnType: 'backend', returnValue: '500', request: 'instruct' }],
        ]);
    });
});
