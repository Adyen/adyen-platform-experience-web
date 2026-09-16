import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--single-hosted-action';

test.describe('Single hosted action', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        await Promise.all([
            expect(page.getByText('Requested funds')).toBeVisible(),
            expect(page.getByText('€20,000.00')).toBeVisible(),
            expect(page.getByText('Action needed')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByTestId('grant-id-copy-text')).toBeVisible(),
            expect(
                page.getByText(
                    "You're almost ready. To process your funds, we just need your input. Please complete this action by February 15, 2025."
                )
            ).toBeVisible(),
            expect(page.getByRole('button', { name: 'Sign terms & conditions' })).toBeVisible(),
            expect(page.getByRole('progressbar', { name: 'Grant repayment' })).toHaveCount(0),
            expect(page.getByRole('button', { name: 'Show grant details' })).toHaveCount(0),
        ]);
    });
});
