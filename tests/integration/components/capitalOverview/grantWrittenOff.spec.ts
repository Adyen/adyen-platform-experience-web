import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';

const sharedAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

const STORY_ID = 'mocked-capital-capital-overview--grant-written-off';

test.describe('Grant: Written off', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render written off grant', async ({ page }) => {
        await expect(page.getByText('Written off')).toBeVisible();
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('copyText')).toBeVisible();
    });

    test('should render tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Written off').hover();
        const tooltip = page.getByText('You accepted these funds but did not repay them');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
