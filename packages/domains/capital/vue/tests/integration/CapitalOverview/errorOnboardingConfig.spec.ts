import { test, expect } from '@integration-components/testing/fixtures/eventDispatcher/events';
import { expectAnalyticsEvents, goToStory } from '@integration-components/testing/playwright/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from '../../../../fixtures/CapitalOverview/constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--error-onboarding-config';

test.describe('Error - Onboarding config', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        const informationSubmitButton = page.getByRole('button', { name: 'Submit information' });
        const signingButton = page.getByRole('button', { name: 'Sign terms & conditions' });

        await Promise.all([
            expect(page.getByText('Requested funds')).toBeVisible(),
            expect(page.getByText('€20,000.00')).toBeVisible(),
            expect(page.getByText('Action needed')).toBeVisible(),
            expect(page.getByText('Grant ID')).toBeVisible(),
            expect(page.getByRole('button', { name: 'Copy grant ID' })).toBeVisible(),
            expect(
                page.getByText(
                    "You're almost ready. To process your funds, we just need your input. Please complete these actions by February 15, 2025."
                )
            ).toBeVisible(),
            expect(informationSubmitButton).toBeVisible(),
            expect(signingButton).toBeVisible(),
            expect(page.getByRole('progressbar')).toBeHidden(),
            expect(page.getByTestId('expand-button')).toBeHidden(),
        ]);
    });
});
