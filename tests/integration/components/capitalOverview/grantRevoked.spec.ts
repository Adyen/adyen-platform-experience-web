import { test, expect } from '../../../fixtures/analytics/events';
import { expectAnalyticsEvents, goToStory } from '../../../utils/utils';

const sharedAnalyticsEventProperties = {
    componentName: 'capitalOverview',
    category: 'Capital overview component',
    subCategory: 'Grants overview',
    label: 'Capital overview',
} as const;

const STORY_ID = 'mocked-capital-capital-overview--grant-revoked';

test.describe('Grant: Revoked', () => {
    test.beforeEach(async ({ page, analyticsEvents }) => {
        await goToStory(page, { id: STORY_ID });
        await expectAnalyticsEvents(analyticsEvents, [['Landed on page', sharedAnalyticsEventProperties]]);
    });

    test('should render revoked grant', async ({ page }) => {
        await expect(page.getByText('Requested funds')).toBeVisible();
        await expect(page.getByText('€20,000.00')).toBeVisible();
        await expect(page.getByText('Revoked')).toBeVisible();
        await expect(page.getByText('Grant ID')).toBeVisible();
        await expect(page.getByTestId('grant-id-copy-text')).toBeVisible();
        await expect(page.getByRole('progressbar')).toBeHidden();
        await expect(page.getByTestId('expand-button')).toBeHidden();
    });

    test('should render tooltip when status tag is hovered', async ({ page }) => {
        await page.getByText('Revoked').hover();
        const tooltip = page.getByText('You accepted but then returned these funds');
        await tooltip.waitFor();
        await expect(tooltip).toBeVisible();
    });
});
