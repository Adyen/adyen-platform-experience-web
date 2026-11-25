import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { OVERVIEW_ANALYTICS, OVERVIEW_REQUEST_ANALYTICS, recordRequests } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--balance-changed';

// The balance changed since what is available was shown, so cashout-ui rejects the cashOut for an amount above what is available by then
test.describe('CashOut Overview - Error - Balance changed', () => {
    test('should offer to try again in the modal, which shows the form again with what is available by then', async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', OVERVIEW_ANALYTICS]]);
        const modal = await openRequestModal(page);

        await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await modal.getByRole('button', { name: 'Cash out now' }).click();

        await Promise.all([
            expect(modal.getByRole('alert').getByText('Your balance changed', { exact: true })).toBeVisible(),
            expect(modal.getByText('Instant CashOut request', { exact: true })).toHaveCount(0),
        ]);

        const eligibilityRequests = recordRequests(page, '/cashout/eligibility');
        await modal.getByRole('button', { name: 'Try again' }).click();

        await Promise.all([
            expect(modal.getByText('You have $150.00 available to cash out')).toBeVisible(),
            expect(modal.getByRole('spinbutton', { name: 'Amount to cash out' })).toHaveValue('150.00'),
            expect(modal.getByText('Instant CashOut request', { exact: true })).toBeVisible(),
            expect(getComponentRoot(page).getByText('$150.00', { exact: true })).toBeVisible(),
        ]);
        // Loaded again by the overview only: the request in its modal waits for it instead of fetching it too
        expect(eligibilityRequests).toHaveLength(1);
        await expectAnalyticsEvents(
            analyticsEvents,
            [
                ['Clicked button', { ...OVERVIEW_ANALYTICS, label: 'Start instant CashOut' }],
                ['Changed bank account', OVERVIEW_REQUEST_ANALYTICS],
                ['Clicked button', { ...OVERVIEW_REQUEST_ANALYTICS, label: 'Cash out now' }],
                ['Encountered error', { ...OVERVIEW_REQUEST_ANALYTICS, returnType: 'backend', request: 'instruct' }],
                ['Clicked button', { ...OVERVIEW_REQUEST_ANALYTICS, label: 'Try again', step: 'result' }],
            ],
            { strictOrder: false }
        );
    });
});
