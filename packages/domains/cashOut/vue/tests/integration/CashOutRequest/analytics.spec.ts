import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { REQUEST_ANALYTICS } from '../shared/utils';

const STORY_ID = 'mocked-cashout-cashout-request--ineligible-transfer-instruments';

// What the standalone request tells, as a component of its own: no amounts nor identifiers, only how much of what is available
test.describe('CashOut Request - Analytics', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Landed on page', { ...REQUEST_ANALYTICS, isAvailable: true, currency: 'USD', balanceAccountCount: '2-9' }],
        ]);
    });

    test('should tell a cashOut of all that is available from its start to its completion', async ({ page, analyticsEvents }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await root.getByRole('option', { name: 'Citi ********5678' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed bank account', { ...REQUEST_ANALYTICS, usedSearch: false, bankAccountCount: '2-9' }],
        ]);

        await root.getByRole('button', { name: 'Cash out now' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Clicked button', { ...REQUEST_ANALYTICS, label: 'Cash out now', isWholeAmount: true, amountShare: '75-100%', isFeeFree: false }],
            [
                'Completed cashOut',
                {
                    ...REQUEST_ANALYTICS,
                    isWholeAmount: true,
                    amountShare: '75-100%',
                    currency: 'USD',
                    secondsToCashOut: expect.any(Number) as unknown as number,
                },
            ],
        ]);
    });

    test('should tell the amount changed once the field is left', async ({ page, analyticsEvents }) => {
        const amountField = getComponentRoot(page).getByRole('spinbutton', { name: 'Amount to cash out' });

        await amountField.fill('50');
        await amountField.blur();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed amount', { ...REQUEST_ANALYTICS, isWholeAmount: false, amountShare: '<25%', isValid: true }],
        ]);
    });

    test('should tell the request was refreshed', async ({ page, analyticsEvents }) => {
        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...REQUEST_ANALYTICS, label: 'Refresh' }]]);
    });
});
