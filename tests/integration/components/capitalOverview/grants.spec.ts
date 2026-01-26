import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grants';

test.describe('Grants', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render grants screen with tabs', async ({ page }) => {
        await expect(page.getByText('Business financing')).toBeVisible();
        await expect(page.getByText('Loans are issued by Adyen N.V.')).toBeVisible();
        await expect(page.getByRole('radio', { name: 'In progress' })).toBeVisible();
        await expect(page.getByRole('radio', { name: 'Closed' })).toBeVisible();
    });

    test('should render closed grants when "Closed" tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await expect(page.getByText('Fully repaid')).toBeVisible();
        await expect(page.getByText('Revoked')).toBeVisible();
        await expect(page.getByText('Written off')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Failed' })).toBeVisible();
    });

    test('should render in-progress grants when "In progress" tab is clicked', async ({ page }) => {
        await page.getByRole('radio', { name: 'Closed' }).click();
        await page.getByRole('radio', { name: 'In progress' }).click();
        await expect(page.getByText('Term ends:').first()).toBeVisible();
    });
});
