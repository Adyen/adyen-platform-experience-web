import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-single-action-hosted';

test.describe('Grant: Single action - Hosted', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant with actions', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Action needed')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(
            page.getByText('Please wait and don’t refresh the page. We are processing your request and it might take a minute.')
        ).toBeVisible();

        /* The following assertions will be resolved in about 1 minute. To cut down the run time of tests they are skipped.
        await expect(
            page.getByText('We need a bit more input from you to process your funds. Please complete this action by February 15, 2025.')
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign terms & conditions' })).toBeVisible();
        */

        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });
});
