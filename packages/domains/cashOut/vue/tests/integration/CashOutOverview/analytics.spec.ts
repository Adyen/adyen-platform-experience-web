import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, getComponentRoot, goToStory } from '@integration-components/testing/playwright/utils';
import { OVERVIEW_ANALYTICS, OVERVIEW_REQUEST_ANALYTICS } from '../shared/utils';
import { openRequestModal } from './shared/utils';

const STORY_ID = 'mocked-cashout-cashout-overview--default';

// What the overview tells, with the request in its modal as part of it: no amounts nor identifiers, only how much of what is available
test.describe('CashOut Overview - Analytics', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [
            ['Landed on page', { ...OVERVIEW_ANALYTICS, isAvailable: true, currency: 'USD', balanceAccountCount: '2-9' }],
        ]);
    });

    test('should tell a cashOut from its start to its completion, and the request closed', async ({ page, analyticsEvents }) => {
        const modal = await openRequestModal(page);
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...OVERVIEW_ANALYTICS, label: 'Start instant CashOut' }]]);

        await modal.getByRole('spinbutton', { name: 'Amount to cash out' }).fill('100');
        await modal.getByRole('combobox', { name: 'Account to deposit into' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed amount', { ...OVERVIEW_REQUEST_ANALYTICS, isWholeAmount: false, amountShare: '25-50%', isValid: true }],
        ]);

        await modal.getByRole('option', { name: 'NL**ABNA******4300' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed bank account', { ...OVERVIEW_REQUEST_ANALYTICS, usedSearch: false, bankAccountCount: '2-9' }],
        ]);

        await expect(modal.getByRole('status')).toContainText('You will receive $98.00');
        await modal.getByRole('button', { name: 'Cash out now' }).click();
        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Clicked button',
                { ...OVERVIEW_REQUEST_ANALYTICS, label: 'Cash out now', isWholeAmount: false, amountShare: '25-50%', isFeeFree: false },
            ],
            [
                'Completed cashOut',
                {
                    ...OVERVIEW_REQUEST_ANALYTICS,
                    isWholeAmount: false,
                    amountShare: '25-50%',
                    currency: 'USD',
                    secondsToCashOut: expect.any(Number) as unknown as number,
                },
            ],
        ]);

        await modal.getByRole('button', { name: 'Close' }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...OVERVIEW_REQUEST_ANALYTICS, label: 'Close', step: 'result' }]]);
    });

    test('should tell an amount above what is available, and the request closed without cashing out', async ({ page, analyticsEvents }) => {
        const modal = await openRequestModal(page);
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...OVERVIEW_ANALYTICS, label: 'Start instant CashOut' }]]);
        const amountField = modal.getByRole('spinbutton', { name: 'Amount to cash out' });

        await amountField.fill('300');
        await expectAnalyticsEvents(analyticsEvents, [
            ['Encountered error', { ...OVERVIEW_REQUEST_ANALYTICS, returnType: 'validation', returnValue: 'excess', field: 'amount' }],
        ]);

        await amountField.blur();
        await expectAnalyticsEvents(analyticsEvents, [['Changed amount', { ...OVERVIEW_REQUEST_ANALYTICS, isWholeAmount: false, isValid: false }]]);

        await modal.getByRole('button', { name: 'Close' }).click();
        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...OVERVIEW_REQUEST_ANALYTICS, label: 'Close', step: 'form' }]]);
    });

    test('should tell another balance account was selected', async ({ page, analyticsEvents }) => {
        const root = getComponentRoot(page);

        await root.getByRole('combobox', { name: 'Balance account' }).click();
        await root.getByRole('option', { name: 'S. Hopper - Secondary Account' }).click();

        await expectAnalyticsEvents(analyticsEvents, [
            ['Changed balance account', { ...OVERVIEW_ANALYTICS, usedSearch: false, balanceAccountCount: '2-9' }],
        ]);
    });

    test('should tell the overview was refreshed', async ({ page, analyticsEvents }) => {
        await getComponentRoot(page).getByRole('button', { name: 'Refresh' }).click();

        await expectAnalyticsEvents(analyticsEvents, [['Clicked button', { ...OVERVIEW_ANALYTICS, label: 'Refresh' }]]);
    });
});
