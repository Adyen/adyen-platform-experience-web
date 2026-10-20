import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory, updateStoryArgs } from '@integration-components/testing/playwright/utils';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--eligible';

/**
 * Core events from the Mixpanel core-events data dictionary, asserted on the Capital
 * component as a second consumer of the same core-level tracking.
 */
test.describe('Core events', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });

        await expectAnalyticsEvents(
            analyticsEvents,
            [
                // The storybook container initializes Core without theme or appearance options,
                // so Initiated core omits them, and the capital story configures no component
                // appearance, so the style event omits the key entirely.
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
                        label: 'capitalOverview',
                    },
                ],
                [
                    'Customized component data',
                    {
                        category: 'PIE',
                        subCategory: 'Overview',
                        label: 'capitalOverview',
                        hasOnContactSupport: false,
                    },
                ],
                [
                    'Landed on page',
                    {
                        ...sharedCapitalOverviewAnalyticsEventProperties,
                        hasGrants: true,
                        hasOffer: true,
                    },
                ],
            ],
            { strictOrder: false }
        );
    });

    test('tracks a runtime theme switch with the affected capital component', async ({ page, analyticsEvents }) => {
        await updateStoryArgs(page, STORY_ID, { themeDark: true });

        await expectAnalyticsEvents(analyticsEvents, [
            [
                'Updated theme (runtime)',
                {
                    category: 'PIE',
                    subCategory: 'Core',
                    // Core is initialized without an explicit theme, so the theme it
                    // had before the first runtime switch is reported as 'default'.
                    theme: 'dark',
                    previousTheme: 'default',
                    components: ['capitalOverview'],
                },
            ],
        ]);

        // The theme is applied without a page reload.
        await expect(page.getByTestId('capital-header')).toBeVisible();
    });
});
