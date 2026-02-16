import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';
import { sharedGrantsOverviewAnalyticsEventProperties } from './constants/analytics';

const STORY_ID = 'mocked-capital-capital-overview--grant-pending';

test.describe('Grant: Pending', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedGrantsOverviewAnalyticsEventProperties]]);
    });

    test('should render pending grant', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Pending')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByText('We received your request and we’re working on it now. Check back soon for the next steps.')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render a tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Pending').hover();
        const tooltip = page.getByText('You should get the funds within one business day');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });

    test('should render a tooltip with the grant ID when "Grant ID" label is hovered', async ({ page }) => {
        await page.getByText('Grant ID').hover();
        const tooltip = page.getByText('7e18b082372f');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
