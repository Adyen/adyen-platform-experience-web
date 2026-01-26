import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-multiple-actions';

test.describe('Grant: Multiple Missing Actions', () => {
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
        await expect(page.getByText('We need a bit more information to process your funds. Please complete these actions:')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Go to Terms & Conditions' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Submit information' })).toBeVisible();
    });
});
