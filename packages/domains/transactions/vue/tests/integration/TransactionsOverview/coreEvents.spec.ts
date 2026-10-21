import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../fixtures/constants/TransactionsOverview';

const STORY_ID = 'mocked-transactions-transactions-overview--default';

/**
 * Core events from the Mixpanel core-events data dictionary. They are emitted by the SDK
 * itself — once per core initialization and once per component mount — and complement
 * the component interaction events tracked elsewhere.
 */
test.describe('Core events', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(
            analyticsEvents,
            [
                [
                    'Initiated core',
                    {
                        category: 'PIE',
                        subCategory: 'Core',
                        label: 'core',
                        locale: 'en-US',
                        hasCustomTheme: false,
                    },
                ],
                [
                    'Customized component style',
                    {
                        category: 'PIE',
                        subCategory: 'Overview',
                        label: 'transactions',
                        appearance: ['dataGrid'],
                    },
                ],
                [
                    'Customized component data',
                    {
                        category: 'PIE',
                        subCategory: 'Overview',
                        label: 'transactions',
                        hasOnContactSupport: false,
                        hasOnRecordSelection: false,
                        hasOnDataRetrieve: false,
                        allowLimitSelection: true,
                        hasPreferredLimit: true,
                        hasBalanceAccountId: false,
                    },
                ],
                ['Landed on page', sharedTransactionsListAnalyticsEventProperties],
            ],
            { strictOrder: false }
        );
    });

    test('tracks a runtime theme switch with the previous and new theme', async ({ page, analyticsEvents }) => {
        await updateStoryArgs(page, STORY_ID, { themeDark: true });

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Updated theme (runtime)',
                {
                    category: 'PIE',
                    subCategory: 'Core',
                    theme: 'dark',
                    previousTheme: 'default',
                    components: ['transactions'],
                },
            ],
        ]);

        await updateStoryArgs(page, STORY_ID, { themeDark: false });

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Updated theme (runtime)',
                {
                    category: 'PIE',
                    subCategory: 'Core',
                    theme: 'light',
                    previousTheme: 'dark',
                    components: ['transactions'],
                },
            ],
        ]);
    });

    test('does not send mount events again when only component props update', async ({ page, analyticsEvents }) => {
        await updateStoryArgs(page, STORY_ID, { allowLimitSelection: false });

        await expect(page.getByRole('grid')).toBeVisible();

        await expectAnalyticsEvents(analyticsEvents, []);
    });
});
