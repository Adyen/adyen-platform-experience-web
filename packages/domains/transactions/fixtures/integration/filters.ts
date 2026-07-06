import { expectAnalyticsEvents } from '@integration-components/testing/playwright/utils';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { BalanceAccountFilter, DateRangeFilter } from '@integration-components/testing/playwright/utils/filters';
import { goToView } from './utils';
import {
    sharedTransactionsInsightsAnalyticsEventProperties,
    sharedTransactionsListAnalyticsEventProperties,
} from '../constants/TransactionsOverview';

type FilterVariant = keyof (typeof BalanceAccountFilter | typeof DateRangeFilter);

// [TODO]: Remove once "Modified filter" analytics events stop firing for untouched filters (Bento only)
const FIXME_UNNECESSARY_ANALYTICS_EVENTS_REASON = 'Triggers unnecessary analytic events for untouched filters';

export const testBalanceAccountFilter = (options: { variant: FilterVariant }) => {
    const { variant } = options;
    const Filter = BalanceAccountFilter[variant];
    const fixmeUnnecessaryAnalyticsEvents = variant === 'Bento';

    test.describe('Balance account', () => {
        test.beforeEach(async ({ page }) => {
            await new Filter(page).expand('clickButton');
        });

        test('should render balance account options', async ({ page }) => {
            const filter = new Filter(page);
            await expect(filter.selected).toHaveCount(1);
            await expect(filter.unselected).toHaveCount(2);
        });

        test('should select another balance account option (Transactions View)', async ({ page, analyticsEvents }) => {
            test.fixme(fixmeUnnecessaryAnalyticsEvents, FIXME_UNNECESSARY_ANALYTICS_EVENTS_REASON);

            const selectedBalanceAccountId = await new Filter(page).selectFirstUnselected();

            await expectAnalyticsEvents(analyticsEvents, [
                [
                    'Modified filter',
                    {
                        ...sharedTransactionsListAnalyticsEventProperties,
                        label: 'Balance account filter',
                        value: selectedBalanceAccountId,
                        actionType: 'update',
                    },
                ],
            ]);
        });

        test('should select another balance account option (Insights View)', async ({ page, analyticsEvents }) => {
            test.fixme(fixmeUnnecessaryAnalyticsEvents, FIXME_UNNECESSARY_ANALYTICS_EVENTS_REASON);

            await goToView(page, analyticsEvents, 'Insights');

            const filter = new Filter(page);
            await filter.expand('clickButton');

            const selectedBalanceAccountId = await new Filter(page).selectFirstUnselected();

            await expectAnalyticsEvents(analyticsEvents, [
                [
                    'Modified filter',
                    {
                        ...sharedTransactionsInsightsAnalyticsEventProperties,
                        label: 'Balance account filter',
                        value: selectedBalanceAccountId,
                        actionType: 'update',
                    },
                ],
            ]);
        });

        test('should close filter dialog when the filter button is clicked again', async ({ page }) => {
            await new Filter(page).collapse('clickButton');
        });

        test('should close filter dialog when clicked outside', async ({ page }) => {
            await new Filter(page).collapse('clickOutside');
        });
    });
};

export const testDateRangeFilter = (options: { variant: FilterVariant; now: number }) => {
    const { now, variant } = options;

    const Filter = DateRangeFilter[variant];
    const datePickerOptions = { defaultPreset: 'Last 180 days' } as const;
    const nowTimestampShift = variant === 'Bento' ? 0 : 1; /* +1 here compensates for a time shift */
    const fixmeUnnecessaryAnalyticsEvents = variant === 'Bento';

    const sharedModifiedDateFilterEventProperties = {
        ...sharedTransactionsListAnalyticsEventProperties,
        label: 'Date filter',
        actionType: 'update',
    };

    test.describe('Date range', () => {
        test.beforeEach(async ({ page }) => {
            // [TODO]: Address default date range preset mismatch when this whole describe block is un-fixme'd
            test.fixme(fixmeUnnecessaryAnalyticsEvents, FIXME_UNNECESSARY_ANALYTICS_EVENTS_REASON);
            await new Filter(page, datePickerOptions).expand('clickButton');
        });

        test('should render datepicker', async ({ page }) => {
            const filter = new Filter(page, datePickerOptions);
            await filter.expectPresetRange(datePickerOptions.defaultPreset);

            await filter.selectUnselectedPreset('Year to date', { apply: true });
            await filter.expectPresetRange('Year to date');

            await filter.selectToday({ apply: true, now });
            await filter.expectCustomRange();
        });

        test('should select another date range option (Transactions View)', async ({ page, analyticsEvents }) => {
            const dateRange = await new Filter(page, datePickerOptions).selectUnselectedPreset('Year to date', { apply: true });
            await expectAnalyticsEvents(analyticsEvents, [['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: dateRange }]]);
        });

        test('should select custom date range (Transactions View)', async ({ page, analyticsEvents }) => {
            const filter = new Filter(page, datePickerOptions);
            const timestamps = await filter.selectToday({ apply: true, now: now + nowTimestampShift });

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${timestamps}` }],
            ]);
        });

        test('should reset date range (Transactions View)', async ({ page, analyticsEvents }) => {
            const filter = new Filter(page, datePickerOptions);
            const timestamps = await filter.selectToday({ apply: true, now: now + nowTimestampShift });

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: `${timestamps}` }],
            ]);

            const defaultPreset = await filter.reset();

            await expectAnalyticsEvents(analyticsEvents, [
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, value: defaultPreset }],
                ['Modified filter', { ...sharedModifiedDateFilterEventProperties, actionType: 'reset' }],
            ]);
        });

        test('should close datepicker when the filter button is clicked again', async ({ page }) => {
            await new Filter(page, datePickerOptions).collapse('clickButton');
        });

        test('should close datepicker when clicked outside', async ({ page }) => {
            await new Filter(page, datePickerOptions).collapse('clickOutside');
        });
    });
};
