import type { Page } from '@playwright/test';
import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../domains/capital/fixtures/CapitalOverview/constants/analytics';
import { sharedTransactionsListAnalyticsEventProperties } from '../../../../domains/transactions/fixtures/constants/TransactionsOverview';

const scenarios = [
    {
        componentName: 'capitalOverview',
        storyId: 'mocked-capital-capital-overview--eligible',
        styleProperties: {},
        dataProperties: { hasOnContactSupport: false },
        landedProperties: {
            ...sharedCapitalOverviewAnalyticsEventProperties,
            hasGrants: true,
            hasOffer: true,
        },
        themeChanges: [{ themeDark: true, theme: 'dark', previousTheme: 'default' }],
        getComponent: (page: Page) => page.getByTestId('capital-header'),
    },
    {
        componentName: 'transactions',
        storyId: 'mocked-transactions-transactions-overview--default',
        styleProperties: { appearance: ['dataGrid'] },
        dataProperties: {
            hasOnContactSupport: false,
            hasOnRecordSelection: false,
            allowLimitSelection: true,
            hasPreferredLimit: true,
        },
        landedProperties: sharedTransactionsListAnalyticsEventProperties,
        themeChanges: [
            { themeDark: true, theme: 'dark', previousTheme: 'default' },
            { themeDark: false, theme: 'light', previousTheme: 'dark' },
        ],
        getComponent: (page: Page) => page.getByRole('grid'),
    },
];

// Domain stories host the components; the SDK owns their shared core-event lifecycle.
for (const { componentName, storyId, styleProperties, dataProperties, landedProperties, themeChanges, getComponent } of scenarios) {
    test.describe(`Core events with ${componentName}`, () => {
        test.beforeEach(async ({ page, analyticsEvents }) => {
            await goToStory(page, { id: storyId });

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
                            label: componentName,
                            ...styleProperties,
                        },
                    ],
                    [
                        'Customized component data',
                        {
                            category: 'PIE',
                            subCategory: 'Overview',
                            label: componentName,
                            ...dataProperties,
                        },
                    ],
                    ['Landed on page', landedProperties],
                ],
                { strictOrder: false }
            );
        });

        test('tracks "Updated theme (runtime)" with the previous and new theme', async ({ page, analyticsEvents }) => {
            for (const { themeDark, theme, previousTheme } of themeChanges) {
                await updateStoryArgs(page, storyId, { themeDark });

                await expectAnalyticsEvents(analyticsEvents, [
                    [
                        'Updated theme (runtime)',
                        {
                            category: 'PIE',
                            subCategory: 'Core',
                            theme,
                            previousTheme,
                            components: [componentName],
                        },
                    ],
                ]);

                await expect(getComponent(page)).toBeVisible();
            }
        });

        if (componentName === 'transactions') {
            test('does not send mount events again when only component props update', async ({ page, analyticsEvents }) => {
                await updateStoryArgs(page, storyId, { allowLimitSelection: false });

                await expect(getComponent(page)).toBeVisible();

                await expectAnalyticsEvents(analyticsEvents, []);
            });
        }
    });
}
